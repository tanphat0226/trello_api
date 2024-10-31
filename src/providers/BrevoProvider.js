import { env } from '../config/environment'

const brevo = require('@getbrevo/brevo')

let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  // Create sendSmtpEmail object with necessary data
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Account send mail: admin email is email create on Brevo
  sendSmtpEmail.sender = { name: env.ADMIN_EMAIL_NAME, email: env.ADMIN_EMAIL_ADDRESS }

  // Accounts receive mail
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // Subject of mail
  sendSmtpEmail.subject = customSubject

  // Content of mail in HTML
  sendSmtpEmail.htmlContent = customHtmlContent

  // Call action send email
  // return a promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
