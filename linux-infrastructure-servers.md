# 🐧 AlmaLinuxによるインターネット3大インフラサーバー（Web・DNS・Mail）構築・検証ログ

本資料は、VirtualBox上のAlmaLinux環境において、現代のWebインフラを支える3大サーバー（Web、DNS、Mail）を完全に独立したパッケージから構築し、ホストオンリーネットワーク内で相互連携・名前解決・パケット疎通を確認した実証ログである。

---

## 1. 仮想環境（VirtualBox）およびOS初期インフラ設定

ネットワーク境界を厳密に制御するため、外部インターネット用（NAT）と、検証用ローカル空間（ホストオンリーアダプター）の2系統のNICを構築する。

### 📌 ネットワークアダプターの2重防御設定

• アダプター1: NAT（外部パッケージインストール・アップデート用）
• アダプター2: ホストオンリーアダプター（実習ローカル検証用：192.168.56.x）
	• 設定上の重要ポイント: 予期せぬIP動的割り当てによるサーバーIPの変動を防ぐため、Host-only Networks内のDHCPサーバーのチェックは必ず外す。

### 📌 OSインストール・初期設定（AlmaLinux）

• 言語仕様: 日本語
• ストレージ管理: 新規仮想ハードディスクに対するローカル標準ディスク割り当て（自動パーティション構成）
• アカウント制御: セキュリティのベストプラクティスに基づき、root アカウントの直接利用を避け、管理者権限（sudo）を持つ一般ユーザーをメインとして構築。

---

## 2. インフラサーバー構築コマンド・設定クイックリファレンス

各インフラサーバーの導入パッケージ、主要設定ファイル、およびファイアウォール（firewalld）の透過設定を以下の一覧表に集約する。

|サーバー種別 | 導入パッケージ名 | 主要設定ファイルパス | ファイアウォール許可サービス |
| :--- | :--- | :--- | :--- |
|**🌐 Webサーバー** | httpd (Apache) | /etc/httpd/conf/httpd.conf | http
|**📛 DNSサーバー** | bind, bind-chroot | /etc/named.conf /var/named/example1.jp.zone | dns |
|**✉️ メールサーバー** |postfix, cyrus-sasl dovecot, s-nail | /etc/postfix/main.cf /etc/dovecot/dovecot.conf | smtp,imap |	

---

## 3. 各サーバーの構築手順および運用コマンド

### 3.1 🌐 Webサーバー（Apache: httpd）の構築**
1. **パッケージ導入**
```bash
    sudo dnf install httpd
```
2. **コンテンツ配置**

     ドキュメントルートである $/var/www/html/$ 直下に検証用ディレクトリ（例: finish）を作成し、$index.html$ をデプロイ。

3. **設定整合性チェック・起動**
```bash
sudo apachectl configtest  # Syntax Check（問題なければ何も出力されない）
sudo systemctl start httpd
sudo systemctl enable httpd # 自動起動有効化
```
4. **ファイアウォール透過**
```bash
sudo firewall-cmd --add-service=http --zone=public --permanent
sudo firewall-cmd --reload
```
### 3.2 📛 DNSサーバー（BIND）の構築・名前解決制御

1. **パッケージ導入**
```bash
sudo dnf install bind bind-chroot
```
2. **ゾーン設定ファイルの編集・作成:**

• /etc/named.conf に管理対象ドメイン（例: example1.jp）のゾーン情報を追加。
• テンプレートからゾーンファイルを安全に複製して編集。
```bash
sudo cp -p /var/named/named.empty /var/named/example1.jp.zone
sudo vi /var/named/example1.jp.zone  # Aレコード（ホスト名とIPのマッピング）を記述
```
3. **数理・構文チェック**
```bash
sudo named-checkconf  # named.confの構文チェック
sudo named-checkzone example1.jp. /var/named/example1.jp.zone # ゾーンファイルの厳密性チェック
```
4. **サービス起動とネットワーク接続の制御**
```bash
sudo systemctl start named-chroot
sudo systemctl enable named-chroot
```

**【実習環境における重要トピック】**
```text
: ローカルDNSサーバー間の正確な問い合わせを実証するため、インターネット側のNIC（NAT）を一時的にダウンさせ、リクエストをホストオンリーアダプター側に強制的に固定する。
```
```bash
sudo nmcli connection down enp0s3  # NAT側の接続をダウン
```
5. **動作検証**
```bash
cat /etc/resolv.conf  # ネームサーバーがローカル（128.0.0.1 等）に向いているか確認
dig host1.example1.jp # DNS問い合わせによる名前解決（Aレコード）の確認
```
### 3.3 ✉️ メールサーバー（Postfix / Dovecot）のハイブリッド構築

送信用（MTA）に Postfix、受信用（MDA）に Dovecot、そして認証に Cyrus SASL を採用したフルスタック環境。
1. **パッケージ一括導入**
```bash
   sudo dnf install postfix cyrus-sasl s-nail dovecot thunderbird
```
2. **MTA (Postfix) 設定**

• 設定ファイル: $/etc/postfix/main.cf$<br>
• 変更内容: 自組織のドメイン名、ホスト名、メール配送のポリシー制限の適用。

3. **MUA / MDA (Dovecot) セキュリティおよびプロトコル設定**
セキュアなメールボックスの配置と認証の初期化を行う。

• **メールボックス配置設定** ($/etc/dovecot/conf.d/10-mail.conf$)
```text
mail_location = mbox:~/mail:INBOX=/var/mail/%u
mail_privileged_group = mail
mail_access_groups = mail
```
• **プレインテキスト認証の制御** ($/etc/dovecot/conf.d/10-auth.conf$)
```text
disable_plaintext_auth = no  # 実習ローカル環境検証用
```
• **SSL/TLS制御** ($/etc/dovecot/conf.d/10-ssl.conf$)
```text
ssl = no  # 暗号化なしの純粋プロトコル解析用
```
4. **認証・サービスの起動と自動起動有効化**
```bash
sudo systemctl start saslauthd
sudo systemctl enable saslauthd  # SMTP認証用デーモン起動

sudo systemctl start dovecot
sudo systemctl enable dovecot    # POP3/IMAPサービス起動

sudo postfix check # 設定ファイルの整合性チェック
sudo systemctl start postfix
```
5. **ファイアウォール透過**
```bash
sudo firewall-cmd --add-service=smtp --zone=public --permanent
sudo firewall-cmd --add-service=imap --zone=public --permanent
sudo firewall-cmd --reload
```
---
## 4. インフラ環境の統合疎通・診断コマンド集

構築したインフラが正常に動作しているかを網羅的に確認するための、アーキテクト視点による診断コマンドライン。

• **ファイアウォールのアクティブポリシー確認**
```bash
sudo firewall-cmd --list-all
```
👉 $services:$ の行に $http$, $dns$, $smtp$, $imap$ がすべて並んでいることを目視確認する。

• **インターフェースのIPアドレス割り当て確認**
```bash
ip -4 a
```
👉 ホストオンリーアダプター側のNICに、設計通りの静的IPアドレスがアタッチされているか確認。

• **外部PC（ホストOS等）からのDNS逆引き・名前解決検証**
```cmd
nslookup host1.example1.jp 192.168.56.101
```
• **ログファイルによる状態監視（エラーハンドリング）**
```bash
sudo cat /var/log/httpd/access_log  # Apache アクセスログ
sudo cat /var/log/httpd/error_log   # Apache エラーログ（トラブルシューティングの基本）
```
