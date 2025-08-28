import { useEffect } from 'react';

const ThemeSwitcher = () => {
  const themes = [
    { name: 'default', label: 'Default' },
    { name: 'duck', label: 'Duck' },
    { name: 'white', label: 'White' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const changeTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="theme-switcher flex items-center gap-2">
      {themes.map((theme) => (
        <button
          key={theme.name}
          onClick={() => changeTheme(theme.name)}
          className={`w-6 h-6 rounded-full border-2 ${
            theme.name === 'duck' ? 'bg-yellow-300' : 
            theme.name === 'white' ? 'bg-white' : 'bg-gray-500'
          }`}
          title={`Switch to ${theme.label} theme`}
        />
      ))}
    </div>
  );
};

export default ThemeSwitcher;
