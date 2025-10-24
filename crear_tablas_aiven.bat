@echo off
echo Conectando a MySQL Aiven...
mysql -h mysql-1d1d642c-ayntecnology09-c9f0.f.aivencloud.com -P 28195 -u avnadmin -pAVNS_ToaKrXv3uVC11d4EkY9 defaultdb < crear_base_datos.sql
echo Tablas creadas exitosamente!
pause
