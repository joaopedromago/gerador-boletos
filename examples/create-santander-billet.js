const exampleRequest = {
  beneficiary: {
    ourNumber: "00000011",
    ourNumberDigit: "1",
    account: "16095",
    accountDigit: "0",
    branch: "093",
    branchDigit: "7",
    document: "27970567000147",
    name: "HINOVA PAYMENTS M P S A",
    addressLine1: "R MANOEL ELIAS AGUIAR",
    addressLine2: "OURO PRETO",
    complemento_beneficiario: "SL 3 A",
    city: "BELO HORIZONTE",
    state: "MG",
    zipCode: "31330520"
  },
  payer: {
    name: "PAGADORVIAAPI",
    document: "00056705616008",
    addressLine1: "RUADOPAGADOR",
    addressLine2: "",
    city: "CIDADE",
    state: "MG",
    zipCode: "32215270"
  },
  billetName: "santander",
  specie: "DM",
  local:
    "ATE O VENCIMENTO PAGUE EM QUALQUER BANCO OU CORRESPONDENTE NAO BANCARIO. APOS O VENCIMENTO, ACESSE ITAU.COM.BR/BOLETOS E PAGUE EM QUALQUER BANCO OU CORRESPONDENTE NAO BANCARIO.",
  barCode: "34191802100000150001090000001110937160950000",
  processDay: "20",
  processMonth: "09",
  processYear: "2019",
  documentDay: "20",
  documentMonth: "09",
  documentYear: "2019",
  dueDay: "29",
  dueMonth: "09",
  dueYear: "2019",
  value: 150,
  instructions: [
    "Após o vencimento Mora dia R$ 1,59",
    "Após o vencimento, multa de 2%"
  ]
};
const Gerador = require("../index");
const fs = require("fs");

const init = request => {
  const boleto = createBillet(request);

  const dir = "../temp";

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const writeStream = fs.createWriteStream(
    "../temp/" + request.billetName + ".pdf"
  );

  new Gerador.boleto.Gerador(boleto).gerarPDF(
    {
      creditos: "",
      stream: writeStream
    },
    (err, pdf) => {
      if (err) return console.error(err);

      writeStream.on("finish", () => {
        console.log("written on " + dir + "!");
      });
    }
  );
};

const createBillet = request => {
  const Datas = Gerador.boleto.Datas;
  const bancos = Gerador.boleto.bancos;
  const payer = createPayer(request.payer);
  const beneficiary = createBeneficiary(request.beneficiary);

  return Gerador.boleto.Boleto.novoBoleto()
    .comDatas(
      Datas.novasDatas()
        .comVencimento(request.dueDay, request.dueMonth, request.dueYear)
        .comProcessamento(
          request.processDay,
          request.processMonth,
          request.processYear
        )
        .comDocumento(
          request.documentDay,
          request.documentMonth,
          request.documentYear
        )
    )
    .comBeneficiario(beneficiary)
    .comPagador(payer)
    .comBanco(new bancos.Santander())
    .comValorBoleto(request.value) //Apenas duas casas decimais
    .comNumeroDoDocumento(1001)
    .comEspecieDocumento(request.specie) //Duplicata de Venda Mercantil
    .comLocaisDePagamento([request.local])
    .comInstrucoes(request.instructions)
    .comCodigoDeBarra(request.barCode);
};

const createPayer = payer => {
  const enderecoPagador = Gerador.boleto.Endereco.novoEndereco()
    .comLogradouro(payer.addressLine1)
    .comBairro(payer.addressLine2)
    .comCidade(payer.city)
    .comUf(payer.state)
    .comCep(payer.zipCode);

  return Gerador.boleto.Pagador.novoPagador()
    .comNome(payer.name)
    .comRegistroNacional(payer.document)
    .comEndereco(enderecoPagador);
};

const createBeneficiary = beneficiary => {
  const enderecoBeneficiario = Gerador.boleto.Endereco.novoEndereco()
    .comLogradouro(beneficiary.addressLine1)
    .comBairro(beneficiary.addressLine2)
    .comCidade(beneficiary.city)
    .comUf(beneficiary.state)
    .comCep(beneficiary.zipCode);

  return Gerador.boleto.Beneficiario.novoBeneficiario()
    .comNome(beneficiary.name)
    .comRegistroNacional(beneficiary.document)
    .comAgencia(beneficiary.branch)
    .comDigitoAgencia(beneficiary.branchDigit)
    .comCodigoBeneficiario(beneficiary.account)
    .comDigitoCodigoBeneficiario(beneficiary.accountDigit)
    .comNossoNumero(beneficiary.ourNumber)
    .comDigitoNossoNumero(beneficiary.ourNumberDigit)
    .comEndereco(enderecoBeneficiario);
};

init(exampleRequest);