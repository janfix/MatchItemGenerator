//Pure Texte Parser
var tool = "Wiquid.AI";


$('#mybutton').on("click",function () {
  var rawData = $('textarea#mytextarea').val();
  let Prompt = $("#prompt").val();
  let title = $("#title").val();
  let label = $("#label").val();
  //send to server and process response
  // Diviser les données en lignes
  let lines = rawData.split('\n');

  // Extraire les en-têtes (noms des pays)
  let headers = lines[0].split('\t');

  // Initialiser un tableau pour stocker les données
  let data = [];
  let topRow = [];
  let LeftCol = [];
  let idData = [] // [{Paris, choice_1}]
  let AllAnswers = [];
  


 //Identifier attribution
  setTopRowIDs()
  setLeftColIDs() 
  
  // Traiter chaque ligne
  for (let i = 1; i < lines.length; i++) {
    let row = lines[i].split('\t');
    let rowData = { 'Row': row[0] };
    for (let j = 1; j < headers.length; j++) {
      rowData[headers[j]] = row[j].trim() === '[x]';
      if (rowData[headers[j]]){
        let Rep = '<value><![CDATA[' + getId(headers[j]) + ' ' + getId(row[0]) +']]></value>'
        AllAnswers.push(Rep)
      }
    }
    data.push(rowData);
  }



  //Identifier attribution
  function setTopRowIDs(){
    for (let k = 1; k < headers.length; k++) {
      let content = {} 
      if (headers[k].length>0){ 
      content.name = headers[k];
      content.id = "choice_"+k;
        topRow.push(content)
      }
    }
     
  }

  function setLeftColIDs(){
    for (let l = 1; l < lines.length; l++) {
      let content = {} 
      let row = lines[l].split('\t');
      if(row[0].length>0){
        content.name = row[0];
        let number = l +(headers.length-1);
        content.id = "choice_" + number;
        LeftCol.push(content)
      }
    }
  }

  
  function generateXMLTopRow(){
    let XmlTopRow = []; 
    for (let i = 0; i < topRow.length; i++) { 
      XmlTopRow.push('<simpleAssociableChoice identifier="'+getId(topRow[i].name)+'" matchMax="1">'+topRow[i].name+'</simpleAssociableChoice>')
    }
    return XmlTopRow
  }

  function generateXMLLeftCol(){
    let XmlLeftCol = []; 
    for (let i = 0; i < LeftCol.length; i++) {
      XmlLeftCol.push('<simpleAssociableChoice identifier="' + getId(LeftCol[i].name) + '" matchMax="1">' + LeftCol[i].name + '</simpleAssociableChoice>')
    }
    return XmlLeftCol
  }
  
  //Getting Id   
function getId(label){
  let elID;
  for (let i = 0; i < topRow.length; i++) {
    if(topRow[i].name === label){
      elID = topRow[i].id
    }
  }
  for (let j = 0; j < LeftCol.length; j++) {
    if (LeftCol[j].name === label) {
      elID = LeftCol[j].id
    }
  }
return elID
}

  
  XmlCreator(AllAnswers)
  function XmlCreator(AllAnswers) {
    if (AllAnswers.length<1){
      alert("Paste a text formated table!")
      return
    }

    let xml, xml1 = '<?xml version="1.0" encoding="UTF-8"?> <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd" identifier="i6554cd4f625b0483db78e3f582f8ce4" title="' + title + '" label="' + label + '" xml:lang="'+$('#language').val()+'" adaptive="false" timeDependent="false" toolName="Wiquid.AI" toolVersion="2023.12">';
    let xmlResponse = '<responseDeclaration identifier="RESPONSE" cardinality="multiple" baseType="directedPair"> <correctResponse>' + AllAnswers.join("") + ' </correctResponse> </responseDeclaration>';
    let xmlBody = '<itemBody> <matchInteraction responseIdentifier="RESPONSE" maxAssociations="' + data.length +'"> <prompt>' + Prompt + '</prompt> <simpleMatchSet>'+ 
      generateXMLTopRow().join("") 
      + '</simpleMatchSet> <simpleMatchSet>' + generateXMLLeftCol().join("")  +'</simpleMatchSet></matchInteraction> </itemBody>'; 
    let xmlEnd = '<responseProcessing template="http://www.imsglobal.org/question/qti_v2p2/rptemplates/match_correct"/> </assessmentItem>'
    
    xml = xml1 + xmlResponse + xmlBody + xmlEnd; 

    $("#newqti").val(xml);
    $(".downloadBT").prop("disabled", false)
    
    return xml

  }


});


$('#download-btn').click(function () {
  var xmlText = $('#newqti').val();
  var blob = new Blob([xmlText], { type: 'text/xml' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'qti.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

