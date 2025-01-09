interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }
  
  export const sendEmail = async (options: EmailOptions): Promise<void> => {
    // Implement email sending logic using your preferred email service
    console.log('Sending email:', options);
  };