const path = require('path');
const StringUtils = require('../../utils/string-utils')
const pad = StringUtils.pad;
const insert = StringUtils.insert;


const GeradorDeDigitoPadrao = require('../gerador-de-digito-padrao');
const CodigoDeBarrasBuilder = require('../codigo-de-barras-builder');

var Santander = (function() {
  var NUMERO_SANTANDER = '033',
    DIGITO_SANTANDER = '7';

  function Santander() {

  }

  Santander.prototype.getTitulos = function() {
    return {};
  };

  Santander.prototype.exibirReciboDoPagadorCompleto = function() {
    return false;
  };

  Santander.prototype.exibirCampoCip = function() {
    return false;
  };

  Santander.prototype.geraCodigoDeBarrasPara = function(boleto) {
    if(boleto._codigoBarra !== undefined){
      return boleto._codigoBarra;
    }

    var beneficiario = boleto.getBeneficiario(),
      campoLivre = [];

    campoLivre.push(this.getCarteiraFormatado(beneficiario));
    campoLivre.push(this.getNossoNumeroFormatado(beneficiario));
    campoLivre.push(beneficiario.getAgenciaFormatada());
    campoLivre.push(this.getCodigoFormatado(beneficiario));
    campoLivre.push('000');
    
    campoLivre = campoLivre.join('');

    var digito1 = GeradorDeDigitoPadrao.mod10(campoLivre.substring(11, 20));
    campoLivre = insert(campoLivre, 20, digito1);

    var digito2 = GeradorDeDigitoPadrao.mod10(campoLivre.substring(11, 20) + campoLivre.substring(0, 11));
    campoLivre = insert(campoLivre, 11, digito2);
    
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  Santander.prototype.getNumeroFormatadoComDigito = function() {
    return [NUMERO_SANTANDER, DIGITO_SANTANDER].join('-');
  }

  Santander.prototype.getCarteiraFormatado = function(beneficiario) {
    return pad(beneficiario.getCarteira(), 3, '0');
  }

  Santander.prototype.getCarteiraTexto = function(beneficiario) {
    return this.getCarteiraFormatado(beneficiario);
  }

  Santander.prototype.getCodigoFormatado = function(beneficiario) {
    return pad(beneficiario.getCodigoBeneficiario(), 5, '0');
  }

  Santander.prototype.getImagem = function() {
    return path.join(__dirname, 'logotipos/santander.png');
  }

  Santander.prototype.getNossoNumeroFormatado = function(beneficiario) {
    return pad(beneficiario.getNossoNumero(), 8, '0');
  }

  Santander.prototype.getNossoNumeroECodigoDocumento = function(boleto) {
    var beneficiario = boleto.getBeneficiario();

    return [
      beneficiario.getCarteira(),
      this.getNossoNumeroFormatado(beneficiario),
    ].join('/') + '-' + beneficiario.getDigitoNossoNumero();
  }

  Santander.prototype.getNumeroFormatado = function() {
    return NUMERO_SANTANDER;
  }

  Santander.prototype.getNome = function() {
    return '';
  }

  Santander.prototype.getImprimirNome = function() {
    return true;
  }

  Santander.prototype.getAgenciaECodigoBeneficiario = function(boleto) {
    var beneficiario = boleto.getBeneficiario(),

      codigo = this.getCodigoFormatado(beneficiario),
      digitoCodigo = beneficiario.getDigitoCodigoBeneficiario();

    if (digitoCodigo) {
      codigo += '-' + digitoCodigo;
    }

    return beneficiario.getAgenciaFormatada() + '/' + codigo;
  }

  Santander.novoSantander = function() {
    return new Santander();
  }

  return Santander;
})();

module.exports = Santander;
