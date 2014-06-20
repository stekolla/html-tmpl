(function() {

var tmpl = {};

tmpl.processDocument = function() {
  tmpl.processLinks();
  tmpl.processElements();
};

tmpl.shouldProcessElement = function(element) {
  return $(element).attr('data-processed') != '1'
};

tmpl.markElementAsProcessed = function(element) {
  $(element).attr('data-processed', '1');
};

tmpl.processLinks = function() {
  var links = $('link[rel="template"]');
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (tmpl.shouldProcessElement(link)) {
      tmpl.processLink(link);
    }
  }
};

tmpl.templateNamesToHrefs = {};

tmpl.processLink = function(link) {
  var $link = $(link);
  var templateName = $link.data('name');
  var templateHref = $link.attr('href');
  tmpl.templateNamesToHrefs[templateName] = templateHref;
  tmpl.markElementAsProcessed(link);
};

tmpl.processElements = function() {
  var elements = $('*[data-template]');
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (tmpl.shouldProcessElement(element)) {
      tmpl.processElement(element);
    }
  }
};

tmpl.processElement = function(element) {
  var templateHref = tmpl.getElementTemplateHref(element);
  tmpl.loadTemplate(templateHref).then(function(template) {
    var filledTemplate = tmpl.fillTemplateContent(template, element);
    tmpl.insertFilledTemplate(filledTemplate, element);
    tmpl.markElementAsProcessed(element);
  });
};

tmpl.getElementTemplateHref = function(element) {
  var nameOrHref = $(element).data('template');
  return tmpl.templateNamesToHrefs[nameOrHref] || nameOrHref;
};

tmpl.loadTemplate = function(href) {
  return $.ajax(href).then(tmpl.parseHtml);
};

tmpl.parseHtml = function(html) {
  return $.parseHTML($.trim(html));
};

tmpl.fillTemplateContent = function(template, contentParent) {
  var filledTemplate = $(template).clone();
  var contentHolders = $('*[data-content]', filledTemplate);
  for (var i = 0; i < contentHolders.length; i++) {
    var $contentHolder = $(contentHolders[i]);
    var contentSelector = $contentHolder.data('content');
    $contentHolder.append($(contentSelector, contentParent));
  }
  return filledTemplate;
};

tmpl.insertFilledTemplate = function(filledTemplate, element) {
  $(element).empty().append(filledTemplate);
};

tmpl.processDocument();

})();