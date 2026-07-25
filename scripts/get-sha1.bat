@echo off
echo ============================================
echo  Obtener SHA-1 del debug.keystore
echo ============================================
echo.

set KEYSTORE_PATH=android\app\debug.keystore
if not exist "%KEYSTORE_PATH%" (
    echo ERROR: No se encontro %KEYSTORE_PATH%
    echo Asegurate de ejecutar este script desde la raiz del proyecto.
    exit /b 1
)

keytool -list -v -keystore "%KEYSTORE_PATH%" -alias androiddebugkey -storepass android -keypass android

echo.
echo ============================================
echo  Copia el SHA1 (sin espacios) y agregalo en:
echo  Google Cloud Console ^> APIs ^& Services ^> Credentials
echo  Restriccion Android: package=com.anonymous.AppRestaurante
echo ============================================
pause
