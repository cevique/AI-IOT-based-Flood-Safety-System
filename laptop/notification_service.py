import os
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class NotificationService:
    def __init__(self):
        # Telegram Config
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
        
        # Email Config
        self.email_sender = os.getenv("EMAIL_SENDER")
        self.email_password = os.getenv("EMAIL_PASSWORD")
        self.email_receiver = os.getenv("EMAIL_RECEIVER")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))

    def send_telegram(self, message):
        if not self.telegram_bot_token or not self.telegram_chat_id:
            print("Telegram credentials not found.")
            return
        
        url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
        payload = {
            "chat_id": self.telegram_chat_id,
            "text": message
        }
        try:
            requests.post(url, json=payload)
            print("Telegram message sent.")
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")

    def send_email(self, subject, body):
        if not self.email_sender or not self.email_password or not self.email_receiver:
            print("Email credentials not found.")
            return

        msg = MIMEMultipart()
        msg['From'] = self.email_sender
        msg['To'] = self.email_receiver
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_sender, self.email_password)
            server.send_message(msg)
            server.quit()
            print("Email sent.")
        except Exception as e:
            print(f"Failed to send Email: {e}")

    def send_all(self, subject, message):
        print("--- Sending Alerts (Telegram & Email) ---")
        self.send_telegram(f"{subject}\n{message}")
        self.send_email(subject, message)
        print("-----------------------------------------")
