$content = Get-Content "C:\Users\user\Desktop\opencode\frontend\src\pages\Settings.tsx" -Raw
# Replace > with > in JSX text content (escaping for JSX)
$content = $content -replace 'Configuracoes > Usuarios', 'Configuracoes > Usuarios'
$content = $content -replace 'Configuracoes > Dados', 'Configuracoes > Dados'
Set-Content "C:\Users\user\Desktop\opencode\frontend\src\pages\Settings.tsx" $content