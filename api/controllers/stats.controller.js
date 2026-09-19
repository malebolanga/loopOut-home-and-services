import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

// Cities we actively track — must line up with the coverage used by search
// (see controllers/searchController.js CITY_ALIASES) so the numbers we show
// on the homepage reflect areas the platform actually serves.
const TRACKED_CITIES = [
  { key: 'JHB', label: 'Johannesburg', match: /johannesburg|sandton|randburg|midrand|soweto|roodepoort/i },
  { key: 'PTA', label: 'Pretoria', match: /pretoria|centurion|soshanguve|mamelodi/i },
  { key: 'CPT', label: 'Cape Town', match: /cape town|bellville|stellenbosch|somerset west/i },
  { key: 'PLK', label: 'Polokwane', match: /polokwane|seshego|mankweng|mokopane/i },
];

const round1 = (n) => Math.round(n * 10) / 10;

// Turns a raw count into a rounded, human-friendly label like "1.2k+" or "48".
const formatCount = (n) => {
  if (n >= 1000) return `${round1(n / 1000)}k+`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
  return `${n}`;
};

export const getHomeStats = async (req, res, next) => {
  try {
    const [
      verifiedHostCount,
      listingCount,
      serviceCount,
      helperCount,
      completedBookingCount,
      ratingAgg,
      listingAddresses,
      serviceAddresses,
      helperAddresses,
    ] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Listing.countDocuments(),
      Service.countDocuments(),
      Helper.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
      Listing.find({}, 'address').lean(),
      Service.find({}, 'address').lean(),
      Helper.find({}, 'address').lean(),
    ]);

    const avgRating = ratingAgg?.[0]?.avg ? round1(ratingAgg[0].avg) : null;
    const totalListedItems = listingCount + serviceCount + helperCount;

    const allAddresses = [
      ...listingAddresses.map((l) => l.address),
      ...serviceAddresses.map((s) => s.address),
      ...helperAddresses.map((h) => h.address),
    ].filter(Boolean);

    const cities = TRACKED_CITIES.map(({ key, label, match }) => {
      const count = allAddresses.filter((addr) => match.test(addr)).length;
      return {
        city: key,
        label,
        status: count > 0 ? 'Live' : 'Coming soon',
        count: formatCount(count),
        rawCount: count,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        verifiedHosts: { value: formatCount(verifiedHostCount), raw: verifiedHostCount },
        avgRating: { value: avgRating ? `${avgRating}★` : 'New', raw: avgRating },
        completedBookings: { value: formatCount(completedBookingCount), raw: completedBookingCount },
        totalListings: { value: formatCount(totalListedItems), raw: totalListedItems },
        cities,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getServerStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalSignups,
      verifiedUsers,
      signupsToday,
      signupsThisWeek,
      signupsThisMonth,
      loginsToday,
      loginsThisWeek,
      loginsThisMonth,
      listingCount,
      serviceCount,
      helperCount,
      eventCount,
      bookingCount,
      messageCount,
      commentCount,
      shopCount,
      recentSignups,
      recentLogins,
      dbStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastLogin: { $gte: startOfToday } }),
      User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } }),
      User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } }),
      Listing.countDocuments().catch(() => 0),
      Service.countDocuments().catch(() => 0),
      Helper.countDocuments().catch(() => 0),
      mongoose.connection.collection('events').countDocuments().catch(() => 0),
      Booking.countDocuments().catch(() => 0),
      mongoose.connection.collection('messages').countDocuments().catch(() => 0),
      mongoose.connection.collection('comments').countDocuments().catch(() => 0),
      mongoose.connection.collection('shops').countDocuments().catch(() => 0),
      User.find({}, 'username email avatar createdAt isVerified')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      User.find({ lastLogin: { $ne: null } }, 'username email avatar lastLogin isVerified')
        .sort({ lastLogin: -1 })
        .limit(6)
        .lean(),
      mongoose.connection.db ? mongoose.connection.db.stats().catch(() => ({ storageSize: 0, dataSize: 0 })) : { storageSize: 0, dataSize: 0 },
    ]);

    const storageSizeMB = Number(((dbStats?.storageSize || 0) / (1024 * 1024)).toFixed(2));
    const dataSizeMB = Number(((dbStats?.dataSize || 0) / (1024 * 1024)).toFixed(2));
    const freeTierLimitMB = 512;
    const freeSpaceMB = Number(Math.max(0, freeTierLimitMB - storageSizeMB).toFixed(2));
    const percentUsed = Number(((storageSizeMB / freeTierLimitMB) * 100).toFixed(2));

    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

    const memoryUsage = process.memoryUsage();
    const memoryRSS_MB = Number((memoryUsage.rss / (1024 * 1024)).toFixed(1));
    const memoryHeap_MB = Number((memoryUsage.heapUsed / (1024 * 1024)).toFixed(1));

    const data = {
      success: true,
      timestamp: new Date().toISOString(),
      users: {
        totalSignups,
        verifiedUsers,
        unverifiedUsers: totalSignups - verifiedUsers,
        signupsToday,
        signupsThisWeek,
        signupsThisMonth,
        recentSignups,
      },
      logins: {
        loginsToday,
        loginsThisWeek,
        loginsThisMonth,
        recentLogins,
      },
      storage: {
        provider: 'MongoDB Atlas (M0 Free Tier)',
        storageUsedMB: storageSizeMB,
        dataSizeMB,
        totalLimitMB: freeTierLimitMB,
        freeSpaceMB,
        percentUsed: `${percentUsed}%`,
        percentFree: `${(100 - percentUsed).toFixed(2)}%`,
      },
      platformStats: {
        listings: listingCount,
        services: serviceCount,
        helpers: helperCount,
        events: eventCount,
        bookings: bookingCount,
        messages: messageCount,
        comments: commentCount,
        shops: shopCount,
      },
      serverHealth: {
        uptime: `${uptimeHours}h ${uptimeMinutes}m (${uptimeSeconds}s)`,
        memoryUsage: `${memoryRSS_MB} MB (Heap: ${memoryHeap_MB} MB)`,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
    };

    if (req.query.format === 'json') return res.status(200).json(data);

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LoopOut - Server & Analytics Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(22, 27, 46, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --primary: #3b82f6;
      --accent: #10b981;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', -apple-system, sans-serif;
      background: radial-gradient(circle at top right, #1e1b4b 0%, #0b0f19 50%, #030712 100%);
      color: var(--text);
      min-height: 100vh;
      padding: 32px 20px;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      gap: 16px;
    }
    .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .logo span { color: #60a5fa; }
    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .badge-live::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-bottom: 26px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 22px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .card-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); margin-bottom: 8px; }
    .card-val { font-size: 34px; font-weight: 800; color: #fff; margin-bottom: 6px; }
    .card-sub { font-size: 13px; color: var(--text-muted); }
    .progress-bar-bg {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      overflow: hidden;
      margin: 12px 0 6px;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      border-radius: 6px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin: 28px 0 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .table-card { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; }
    td { padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    .pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .pill-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .pill-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .footer { margin-top: 40px; text-align: center; color: var(--text-muted); font-size: 12px; }
    .json-link { color: #60a5fa; text-decoration: none; font-weight: 600; }
    .json-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="logo">Loop<span>Out</span> Server & Analytics</div>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Live health, capacity and user metrics</div>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <a href="?format=json" class="json-link">View Raw JSON</a>
        <div class="badge-live">System Online</div>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <div class="card-title">Total Signups</div>
        <div class="card-val">${data.users.totalSignups}</div>
        <div class="card-sub">${data.users.verifiedUsers} verified (${data.users.unverifiedUsers} pending)</div>
      </div>

      <div class="card">
        <div class="card-title">Logins / Active</div>
        <div class="card-val">${data.logins.loginsToday} <span style="font-size: 16px; font-weight: 500; color: #9ca3af;">today</span></div>
        <div class="card-sub">${data.logins.loginsThisWeek} active this week · ${data.logins.loginsThisMonth} this month</div>
      </div>

      <div class="card">
        <div class="card-title">Database Storage Left</div>
        <div class="card-val" style="color: #34d399;">${data.storage.freeSpaceMB} <span style="font-size: 16px; font-weight: 500;">MB</span></div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${data.storage.percentUsed};"></div>
        </div>
        <div class="card-sub">${data.storage.storageUsedMB} MB used of 512 MB (${data.storage.percentFree} free)</div>
      </div>

      <div class="card">
        <div class="card-title">Server Health & RAM</div>
        <div class="card-val">${data.serverHealth.memoryUsage.split(' ')[0]} <span style="font-size: 16px; font-weight: 500;">MB</span></div>
        <div class="card-sub">Uptime: ${data.serverHealth.uptime} · Node ${data.serverHealth.nodeVersion}</div>
      </div>
    </div>

    <div class="section-title">📦 Platform Content</div>
    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Listings</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.listings}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Helpers</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.helpers}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Services</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.services}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Bookings</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.bookings}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Messages</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.messages}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Comments</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.comments}</div>
      </div>
    </div>

    <div class="section-title">👥 Recently Registered Users</div>
    <div class="card table-card">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Registered At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.users.recentSignups.map(u => `
            <tr>
              <td style="font-weight: 600;">${u.username || 'Anonymous'}</td>
              <td style="color: var(--text-muted);">${u.email || '-'}</td>
              <td>${u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
              <td><span class="pill ${u.isVerified ? 'pill-green' : 'pill-blue'}">${u.isVerified ? 'Verified' : 'Pending'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      LoopOut Home & Services · Server time: ${new Date().toLocaleString()} · Auto-refreshed live from MongoDB Atlas
    </div>
  </div>
</body>
</html>
      `);
    }

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
