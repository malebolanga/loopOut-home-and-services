$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Set-Location "c:\loopOut-home-and-services\client\android"
.\gradlew assembleDebug
