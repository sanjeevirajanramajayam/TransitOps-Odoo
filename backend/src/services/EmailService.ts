import nodemailer from 'nodemailer'
import logger from '../config/logger'

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (host && port && user && pass) {
      return nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass }
      })
    }
    return null
  }

  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      const from = process.env.SMTP_FROM || 'compliance@transitops.com'

      if (transporter) {
        await transporter.sendMail({ from, to, subject, html })
        logger.info(`Email sent successfully to ${to}`, { subject })
        return true
      } else {
        logger.info('[EmailService] Simulated email dispatch', {
          from,
          to,
          subject,
          htmlSnippet: html.substring(0, 150) + '...'
        })
        return true
      }
    } catch (err) {
      logger.error('Failed to send email', { error: err, to, subject })
      return false
    }
  }

  static async sendLicenseWarningEmail(
    to: string,
    driverName: string,
    licenseNumber: string,
    expiryDate: Date,
    daysRemaining: number
  ): Promise<boolean> {
    const isExpired = daysRemaining < 0
    const expiryStr = expiryDate.toISOString().split('T')[0]
    
    let subject = ''
    let html = ''

    if (isExpired) {
      subject = 'URGENT: Your CDL License Has Expired!'
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
          <h2>Action Required: CDL Expired</h2>
          <p>Hello ${driverName},</p>
          <p>This is an automated compliance alert notifying you that your Commercial Driver License (CDL) <b>${licenseNumber}</b> expired on <b>${expiryStr}</b>.</p>
          <p style="color: #d9534f; font-weight: bold;">Your dispatch status is currently blocked until updated credentials are provided.</p>
          <p>Please contact the Safety Officer immediately and upload your renewed license to the TransitOps portal.</p>
          <br>
          <p>Best regards,</p>
          <p><b>TransitOps Compliance Team</b></p>
        </div>
      `
    } else {
      subject = 'Compliance Notice: Your CDL License is Expiring Soon'
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
          <h2>Compliance Alert: CDL Expiring Soon</h2>
          <p>Hello ${driverName},</p>
          <p>This is an automated compliance alert notifying you that your Commercial Driver License (CDL) <b>${licenseNumber}</b> is expiring in <b>${daysRemaining} days</b> on <b>${expiryStr}</b>.</p>
          <p>Please renew your credentials and upload your documents to the TransitOps portal as soon as possible to prevent any disruption to your dispatch availability.</p>
          <br>
          <p>Best regards,</p>
          <p><b>TransitOps Compliance Team</b></p>
        </div>
      `
    }

    return this.sendEmail(to, subject, html)
  }
}
