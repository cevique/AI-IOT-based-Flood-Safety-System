import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class NotificationService:
    def __init__(self):
        # Direct hardcoded credentials for DEMO ONLY
        self.telegram_bot_token = "8535561721:AAHLCxW-CYqCjc4g0lwtxOjZsaqz-Xk1mrE"
        self.telegram_chat_id = "8563775652"
        
        self.email_sender = "sinanulbashir@gmail.com"
        self.email_password = "Bashir1940"
        self.email_receiver = "onlineaffiliater8@gmail.com"
        
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587

    def send_telegram(self, message):
        print("\n📨 FAKE TELEGRAM MESSAGE SENT")
        print(f"To Chat ID: {self.telegram_chat_id}")
        print(f"Message: {message}\n")
        # No API call — just printing for demo

    def send_email(self, subject, body):
        print("📧 FAKE EMAIL SENT")
        print(f"From: {self.email_sender}")
        print(f"To: {self.email_receiver}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}\n")
        # No SMTP connection — just printing for demo

    def send_all(self, subject, message):
        print("=== DEMO: Sending Alerts (Telegram + Email) ===")
        self.send_telegram(f"{subject}\n{message}")
        self.send_email(subject, message)
        print("================================================")


notifier = NotificationService()
notifier.send_all("🚨 Rising Water Detected!", "Water level increased by 4.3 cm in 12 seconds.")
notifier.send_all("🚨 Critical Flood Alert!", "Water level increased by 15 cm in 30 seconds. Immediate action required!")