$(function() {
  var url = '/scripts/pdf/files/example.pdf';
  PDFJS.workerSrc = '/scripts/pdf/pdf.worker.js';

  $.fn.pdf = function(options) {
    this.each(function() {
      var $this = $(this);
      var context = this;

      this.settings = $.extend({
        url: '',
        doc: null,
        page: 1,
        rendering: false,
        pending: null,
        scale: 0.8,
        canvas: null,
        context: null,
        prev: $('<a href="#" class="viewer-arrow prev"><i class="pe-7s-angle-left"></i></a>'),
        next: $('<a href="#" class="viewer-arrow next"><i class="pe-7s-angle-right"></i></a>')
      }, options);

      this.renderPage = function(number) {
        context.settings.rendering = true;
        context.settings.doc.getPage(number)
          .then(function(page) {
            var viewport = page.getViewport(context.settings.scale);

            context.settings.canvas.height = viewport.height;
            context.settings.canvas.width = viewport.width;

            var renderContext = {
              canvasContext: context.settings.context,
              viewport: viewport
            };
            var renderTask = page.render(renderContext);

            renderTask.promise
              .then(function() {
                context.settings.rendering = false;
                if (context.settings.pending !== null) {
                  context.renderPage(context.settings.pending);
                  context.settings.pending = null;
                }
              });
          });

        //document.getElementById('page_num').textContent = pageNum;
      }

      this.queueRenderPage = function(number) {
        if (context.settings.rendering) {
          context.settings.pending = number;
        } else {
          context.renderPage(number);
        }
      }

      this.onPrevPage = function() {
        if (context.settings.page <= 1) {
          return;
        }
        context.settings.page--;
        context.queueRenderPage(context.settings.page);
      }

      this.onNextPage = function() {
        if (context.settings.page >= context.settings.doc.numPages) {
          return;
        }
        context.settings.page++;
        context.queueRenderPage(context.settings.page);
      }

      $this.wrap('<div class="viewer"></div>');

      if (context.settings.prev !== null && context.settings.prev instanceof jQuery) {
        context.settings.prev.bind('click', function(event) {
          event.preventDefault();
          context.onPrevPage();
        });
        context.settings.prev.insertBefore($this);
      }

      if (context.settings.next !== null && context.settings.next instanceof jQuery) {
        context.settings.next.bind('click', function(event) {
          event.preventDefault();
          context.onNextPage();
        });
        context.settings.next.insertAfter($this);
      }
      
      context.settings.canvas = this;
      context.settings.context = context.settings.canvas.getContext('2d');

      PDFJS.getDocument(context.settings.url)
        .then(function(doc) {
          context.settings.doc = doc;
          //document.getElementById('page_count').textContent = pdfDoc.numPages;
          context.renderPage(context.settings.page);
        });
    });
  };
});