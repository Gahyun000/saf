rem -----------------------------
rem
rem   please reconfigure below variables
rem
rem -----------------------------
@set EXTROOT=D:\opt\gauss\opt\SpecSAF

@set HOME_PATH=D:\waas
@set SERVICE_TITLE=WAAS


call %HOME_PATH%\bin\wenv.bat


echo Alias /saf %EXTROOT%                          >> %APACHE_HOME%/conf/httpd.conf
echo ^<Directory "%EXTROOT%"^>                       >> %APACHE_HOME%/conf/httpd.conf
echo     Options Indexes FollowSymLinks ExecCGI      >> %APACHE_HOME%/conf/httpd.conf
echo     AllowOverride None                          >> %APACHE_HOME%/conf/httpd.conf
echo     Require all granted                         >> %APACHE_HOME%/conf/httpd.conf
echo ^</Directory^>                                  >> %APACHE_HOME%/conf/httpd.conf


@%HOME_PATH%\apache\bin\httpd.exe -k stop -n %SERVICE_TITLE%_APACHE
@%HOME_PATH%\apache\bin\httpd.exe -k uninstall -n %SERVICE_TITLE%_APACHE

@%HOME_PATH%\apache\bin\httpd.exe -k install -n %SERVICE_TITLE%_APACHE -f %HOME_PATH%\apache\conf\httpd.conf
@%HOME_PATH%\apache\bin\httpd.exe -k start -n %SERVICE_TITLE%_APACHE -f %HOME_PATH%\apache\conf\httpd.conf
