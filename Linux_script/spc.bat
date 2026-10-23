@echo off
set HOSTNAME=192.168.56.101
set USERNAME=admin
set PORT=22

rem ファイル送信
scp -P %PORT% %1 %USERNAME%@%HOSTNAME%:/home/admin/
