import axios from 'axios';
import nodemailer from 'nodemailer';

const SMTP_SERVER = process.env.SMTP_SERVER || "sandbox.smtp.mailtrap.io";
const SMTP_PORT = process.env.SMTP_PORT || 2525;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const API_URL = process.env.API_URL;

const transporter = nodemailer.createTransport({
  host: SMTP_SERVER,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD
  }
});

exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      const username = body.username;
      const status = body.status;
      const videoName = body.nome || "Arquivo desconhecido";
      const url = body.url || "";

      if (!username || !status) {
        console.log("Mensagem inválida: 'username' ou 'status' não encontrado");
        continue;
      }

      const email = await getEmailFromApi(username);
      if (email) {
        const { subject, content } = getEmailContent(status, videoName, url);
        await sendEmail(email, subject, content);
      } else {
        console.log(`Email não encontrado para o usuário: ${username}`);
      }
    }
  } catch (error) {
    console.error(`Erro ao processar evento: ${error.message}`);
  }
};

function getEmailContent(status, name, url) {
  if (status === 'ERRO') {
    return {
      subject: "🚨 Problema no processamento",
      content: `Ocorreu um erro ao processar o vídeo **${name}**. Nossa equipe foi notificada e está analisando o problema.`
    };
  } else if (status === 'PROCESSADO') {
    return {
      subject: "✅ Processamento concluído",
      content: `O vídeo **${name}** foi processado com sucesso.\n\n👉 Para acessar o arquivo, clique aqui: [${url}](${url})\n\nObrigado por utilizar nosso serviço!`
    };
  } else {
    return {
      subject: "🔔 Status desconhecido",
      content: `Recebemos uma atualização com status: **${status}**.`
    };
  }
}

async function getEmailFromApi(username) {
  try {
    const url = `${API_URL}/api/v1/usuarios/${username}`;
    const response = await axios.get(url);
    return response.data.email;
  } catch (error) {
    console.error(`Erro ao buscar email para '${username}': ${error.message}`);
    return null;
  }
}

async function sendEmail(toEmail, subject, body) {
  try {
    const mailOptions = {
      from: `"Sistema" <${SMTP_USER}>`,
      to: toEmail,
      subject: subject,
      text: body
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${toEmail}: ${result.messageId}`);
  } catch (error) {
    console.error(`Erro ao enviar email para ${toEmail}: ${error.message}`);
  }
}