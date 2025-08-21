import ejs from "ejs";
import path from "path";
import config from "root/src/config/env";
import nodemailer from "nodemailer";

export type CommonData = {
  firstName: string;
  subject?: string;
  imageUrl?: string;
  xUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
};

export type ListSection =
  | { tag: "p"; content: string }
  | { tag: "ul"; content: string; bullets: string[] }
  | {
      tag: "button";
      content: string;
      url: string;
    }
  | { tag: "raw"; html: string };

export type TemplateData = CommonData & { sections: ListSection[] };

const renderEmail = async (data: TemplateData): Promise<string> => {
  const templatePath = path.join(__dirname, "../views/emails/template.ejs");
  return await ejs.renderFile(templatePath, data);
};

const mailer = nodemailer.createTransport({
  host: config.emailHost,
  secure: false,
  port: config.emailPort,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

type BaseMailType = {
  email: string;
  firstName: string;
  lastName?: string;
};

class EmailService {
  static async sendWelcomeAdminEmail({
    firstName,
    email,
    password,
  }: BaseMailType & {  password: string }) {
    const sections: ListSection[] = [
      {
        tag: "raw",
        html: "<p style='font-weight:700;'>Welcome to Revlinks!</p>",
      },
      {
        tag: "p",
        content: `Hello, your admin account has been successfully created. Please find your login details below:`,
      },
      {
        tag: "ul",
        content: "Admin Login Details:",
        bullets: [`Username: ${email}`, `Password: ${password}`],
      },
      {
        tag: "p",
        content: `Please login to the admin dashboard and change your password immediately after first login for security reasons.`,
      },
      {
        tag: "p",
        content:
          "Thank you for joining the Revlinks Asset Management admin team.",
      },
    ];

    const templateData: TemplateData = {
      firstName: firstName,
      subject: "Your Revlinks Admin Account",
      imageUrl: config.imageUrl,
      xUrl: config.xUrl,
      facebookUrl: config.facebookUrl,
      instagramUrl: config.instagramUrl,
      linkedinUrl: config.linkedinUrl,
      sections,
    };

    const html = await renderEmail(templateData);

    const mailOptions = {
      from: `Revlinks <${config.appEmail}>`,
      to: email,
      subject: templateData.subject,
      html,
    };

    await mailer.sendMail(mailOptions);
  }

  static async sendAdminResetPassword({
    email,
    firstName,
    passwordResetUrl,
  }: BaseMailType & {passwordResetUrl: string }) {
    const sections: ListSection[] = [
      {
        tag: "raw",
        html: "<p style='font-weight:700;'>Admin Password Reset</p>",
      },
      {
        tag: "p",
        content: `Hi, we received a request to reset your admin account password. If this was you, please continue with the reset process.`,
      },
      {
        tag: "p",
        content: `Didn't request this? Contact us immediately at info@revocubelinks.com or call +234 803 081 0340.`,
      },
      {
        tag: "button",
        content: "Reset Password",
        url: passwordResetUrl,
      },
    ];

    const templateData: TemplateData = {
      firstName: firstName,
      subject: "Admin Password Reset",
      imageUrl: config.imageUrl,
      xUrl: config.xUrl,
      facebookUrl: config.facebookUrl,
      instagramUrl: config.instagramUrl,
      linkedinUrl: config.linkedinUrl,
      sections,
    };

    const html = await renderEmail(templateData);

    const mailOptions = {
      from: `Revlinks <${config.appEmail}>`,
      to: email,
      subject: templateData.subject,
      html,
    };

    await mailer.sendMail(mailOptions);
  }
}

export default EmailService;
