import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import nodemailer from "nodemailer";
import * as app from "../app.mjs";

describe("Lambda Function", () => {
  let createTransportStub, transporterStub;

  beforeEach(() => {
    transporterStub = {
      sendMail: sinon.stub().resolves({ messageId: "12345" }),
    };

    // Stub do Nodemailer
    createTransportStub = sinon.stub(nodemailer, "createTransport").returns(transporterStub);

    // Stub do Axios
    sinon.stub(axios, "get").resolves({ data: { email: "user@example.com" } });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("Deve buscar o email corretamente da API", async () => {
    const email = await app.getEmailFromApi("testuser");
    expect(email).to.equal("user@example.com");
  });

  it("Deve retornar erro ao buscar email inválido", async () => {
    sinon.restore();
    sinon.stub(axios, "get").rejects(new Error("Erro na API"));
    
    const email = await app.getEmailFromApi("invaliduser");
    expect(email).to.be.null;
  });

  it("Deve formatar email corretamente para status ERRO", () => {
    const { subject, content } = app.getEmailContent("ERRO", "Teste.mp4", "");
    expect(subject).to.equal("🚨 Problema no processamento");
    expect(content).to.include("Ocorreu um erro ao processar o vídeo");
  });

  it("Deve formatar email corretamente para status PROCESSADO", () => {
    const { subject, content } = app.getEmailContent("PROCESSADO", "Teste.mp4", "http://example.com");
    expect(subject).to.equal("✅ Processamento concluído");
    expect(content).to.include("O vídeo **Teste.mp4** foi processado com sucesso");
    expect(content).to.include("[http://example.com](http://example.com)");
  });

  it("Deve formatar email corretamente para status desconhecido", () => {
    const { subject, content } = app.getEmailContent("NOVO_STATUS", "Teste.mp4", "");
    expect(subject).to.equal("🔔 Status desconhecido");
    expect(content).to.include("Recebemos uma atualização com status: **NOVO_STATUS**.");
  });

  it("Deve enviar email com sucesso", async () => {
    await app.sendEmail("user@example.com", "Teste", "Mensagem de teste");
    expect(transporterStub.sendMail.calledOnce).to.be.true;
  });

  it("Deve logar erro ao falhar no envio de email", async () => {
    transporterStub.sendMail.rejects(new Error("Falha no envio"));
    
    await app.sendEmail("user@example.com", "Teste", "Mensagem de teste");
    expect(transporterStub.sendMail.calledOnce).to.be.true;
  });
});
