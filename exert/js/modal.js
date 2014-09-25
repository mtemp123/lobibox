(function(){
    
    var LobiBoxBase = function(type, child){
        this.$type      = null;
        this.$child     = child;
        this.$el        = null;
        this.$options   = null;
        if ( ! LobiBoxBase.OPTIONS.modalClasses.hasOwnProperty(type)){
            return;
        }
        this.$type = type;
        
        window.console.log(this);
    };
    
    LobiBoxBase.prototype = {
        constructor: LobiBoxBase,
        
        _processInput: function(options){
            var me = this;
            if ( ! options.title){
                options.title = Exert.locales.titles[me.$type];
            }
            if ($.isArray(options.buttons)){
                var btns = {};
                for (var i=0; i<options.buttons.length; i++){
                    var btn = LobiBoxBase.OPTIONS.buttons[options.buttons[i]];
                    
                    btns[options.buttons[i]] = btn;
                }
                options.buttons = btns;
            }
            options = $.extend({}, LobiBoxBase.DEFAULT_OPTIONS, options);
            return options;
        },
        _init: function(){
            var me = this;
            me._createMarkup();
            me.setTitle(me.$options.title);
            if (me.$options.draggable){
                me.$el.addClass('draggable');
                me.enableDrag();
            }
            if (me.$options.closeButton){
                me.addCloseButton();
            }
            me.show();
        },
        addCloseButton: function(){
            var me = this;
            var closeBtn = $('<button class="btn-close">&times;</button>');
            me.$el.find('.exert-modal-header').append(closeBtn);
            closeBtn.on('click', function(ev){
                me.destroy();
            });
        },
        hide: function(){
            this.$el.hide();
            $('.exert-backdrop').remove();
        },
        destroy: function(){
            this.$el.remove();
            if ($('.exert-modal[data-is-modal=true]').length === 0){
                $('.exert-backdrop').remove();
            }
        },
        enableDrag: function(){
            var el = this.$el;
            var heading = el.find('.exert-modal-header');
            heading.on('mousedown', function(ev) {
                var offset = el.offset();
                el.attr('offset-left', ev.clientX - offset.left);
                el.attr('offset-top', ev.clientY - offset.top);
                el.attr('allow-drag', 'true');
            });
            heading.on('mouseup', function(ev) {
                el.attr('allow-drag', 'false');
            });
            $(document).on('mousemove.exert', function(ev) {
                if (el.attr('allow-drag') === 'true') {
                    var left = ev.clientX - parseInt(el.attr('offset-left'), 10);
                    var top = ev.clientY - parseInt(el.attr('offset-top'), 10);
                    el.css({
                        left: left,
                        top: top
                    });
                    el.css({
                        right: $(document).width() - (left + el.width() + 2),
                        bottom: $(document).height() - (top + el.height() + 2)
                    });
                }
            });
        },
        _calculatePosition: function(){
            var me = this;
            var left = ($(window).width() - me.$el.width())/2;
            var top  = ($(window).height() - me.$el.height())/2;
            return {
                left: left,
                top: top
            };
        },
        _createButton: function(type, op){
            var me = this;
            var btn = $('<button></button>')
                    .addClass(LobiBoxBase.DEFAULT_OPTIONS.btnClass)
                    .addClass(op['class'])
                    .attr('data-type', type)
                    .html(op.text);
            if (me.$options.callback && typeof me.$options.callback === 'function') {
                btn.on('click', function(ev){
                    var bt = $(this);
                    me.$options.callback(me.$child, bt.data('type'), ev);
                            if (op.closeMessagebox){
                                me.destroy();
                            }
                });
            } else if (op.closeMessagebox){
                btn.click(function() {
                    me.destroy();
                });
            }
            return btn;
        },
        _generateButtons: function(){
            var me = this;
            var btns = [];
            for (var i in me.$options.buttons){
                if (me.$options.buttons.hasOwnProperty(i)){
                    var op = me.$options.buttons[i];
                    var btn = me._createButton(i, op);
                    btns.push(btn);
                }
            }
            return btns;
        },
        _createMarkup: function(){
            var me = this;
            var exert = $('<div class="exert-modal"></div>');
            exert.attr('data-is-modal', me.$options.modal);
            var header = $('<div class="exert-modal-header"></div>')
                    .append('<span class="exert-modal-title"></span>')
                    ;
            var body = $('<div class="exert-modal-body"></div>');
            var footer = $('<div class="exert-modal-footer"></div>');
            footer.append(me._generateButtons());
            
            exert.append(header);
            exert.append(body);
            exert.append(footer);
            me.$el = exert
                    .addClass(LobiBoxBase.OPTIONS.modalClasses[me.$type])
                    ;
        },
        _setSize: function(){
            this.setWidth(this.$options.width);
            this.setHeight(this.$el.height());
        },
        setWidth: function(width){
            this.$el.css('width', width);
        },
        setHeight: function(height){
            this.$el.css('height', height);
        },
        setSize: function(width, height){
            var me = this;
            me.$el.css({
                width   : width,
                height  : height
            });
        },
        setPosition: function(left, top){
            var me = this;
            me.$el.css({
                left: left,
                top: top
            });
        },
        setTitle: function(title){
            var me = this;
            me.$el.find('.exert-modal-title').html(title);
        },
        setMessage: function(msg){
            var me = this;
            me.$el.find('.exert-modal-body').html(msg);
        },
        _addBackdrop: function(){
            if ($('.exert-backdrop').length === 0){
                $('body').append('<div class="exert-backdrop"></div>');
            }
        },
        show: function(){
            var me = this;
            $('body').append(me.$el);
            if (me.$options.modal){
                me._addBackdrop();
            }
        }
        
    };
    
    LobiBoxBase.OPTIONS = {
        modalClasses : {
            'error'     : 'exert-error',
            'success'   : 'exert-success',
            'info'      : 'exert-info',
            'warning'   : 'exert-warning',
            'confirm'   : 'exert-confirm',
            'progress'  : 'exert-progress',
            'prompt'    : 'exert-prompt'
        },
        buttons: {
            ok: {
                'class': 'exert-btn-primary',
                attrs: {},
                text: Exert.locales.buttons.ok,
                closeMessagebox: false
            },
            cancel: {
                'class': 'exert-btn-cancel',
                attrs: {},
                text: Exert.locales.buttons.cancel,
                closeMessagebox: true
            },
            yes: {
                'class': 'exert-btn-success',
                text: Exert.locales.buttons.yes,
                closeMessagebox: false
            },
            no: {
                'class': 'exert-btn-no',
                attrs: {},
                text: Exert.locales.buttons.no,
                closeMessagebox: true
            }
        }
    };

    LobiBoxBase.DEFAULT_OPTIONS = {
        width       : 340,
        closeButton : true,
        draggable   : true,
        btnClass    : 'exert-btn',
        modal       : true
    };
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
    var LobiboxPrompt = function(type, options){
        this.$input         = null;
        this.$options       = null;
        this.prototype = new LobiBoxBase(type, this);
        
        this.$options = this.prototype.$options = this._processInput(options);
        
        this._init();
        window.console.log(this);
//        window.console.log(this.__proto__.constructor.prototype);
    };
    
    LobiboxPrompt.prototype = {
        constructor: LobiboxPrompt,
        
        _processInput: function(options){
            var me = this;
            
            options = me.prototype._processInput(options);
            options.buttons = {
                ok: LobiBoxBase.OPTIONS.buttons.ok,
                cancel: LobiBoxBase.OPTIONS.buttons.cancel
            };
            options = $.extend({}, LobiboxPrompt.DEFAULT_OPTIONS, options);
            return options;
        },
        _createInput: function(){
             var me = this;
             me.$input = $('<input/>');
             if (me.$options.placeholder){
                 me.$input.attr('placeholder', me.$options.placeholder);
             }
            return me.$input;
        },
        setValue: function(val){
            this.$input.val(val);
        },
        getValue: function(){
            return this.$input.val();
        },
        _init: function(){
            var me = this;
            
            me.prototype._init();
            me.prototype.setMessage(me._createInput());
            me.prototype._setSize();
            var pos = me.prototype._calculatePosition();
            me.prototype.setPosition(pos.left, pos.top);
            
        }
    };
    
    LobiboxPrompt.DEFAULT_OPTIONS = {
        placeholder : '',
        value       : ''
    };
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
    var LobiBoxConfirm = function(type, options){
        this.$options           = null;
        
        this.prototype = new LobiBoxBase(type, this);
        
        this.$options = this.prototype.$options = this._processInput(options);
        
        this._init();
        window.console.log(this);
    };
    
    LobiBoxConfirm.prototype = {
        constructor: LobiBoxConfirm,
        
         _processInput: function(options){
             var me = this;
             options = me.prototype._processInput(options);
             
            options.buttons = {
                yes: LobiBoxBase.OPTIONS.buttons.yes,
                no: LobiBoxBase.OPTIONS.buttons.no
            };
            options = $.extend({}, LobiBoxConfirm.DEFAULT_OPTIONS, options);
            return options;
        },
        
        _init: function(){
            var me = this;
            
            me.prototype._init();
            me.prototype.setMessage(me.$options.msg);
            me.prototype._setSize();
            var pos = me.prototype._calculatePosition();
            me.prototype.setPosition(pos.left, pos.top);
            
        }
    };
    
    LobiBoxConfirm.DEFAULT_OPTIONS = {
        
    };
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
    
    var LobiBoxInfo = function(type, options){
        this.$options           = null;
        
        this.prototype = new LobiBoxBase(type, options);
        
        this.$options = this.prototype.$options = this._processInput(options);
        
        this._init();
        window.console.log(this);
    };
    
    LobiBoxInfo.prototype = {
        constructor: LobiBoxInfo,
        
        _processInput: function(options){
            var me = this;
            options = me.prototype._processInput(options);
             
            options = $.extend({}, LobiBoxInfo.DEFAULT_OPTIONS, options);
            return options;
        },
        
        _init: function(){
            var me = this;
            
            me.prototype._init();
            me.prototype.setMessage(me.$options.msg);
            me.prototype._setSize();
            var pos = me.prototype._calculatePosition();
            me.prototype.setPosition(pos.left, pos.top);
            
        }
    };
    
    LobiBoxInfo.DEFAULT_OPTIONS = {
        
    };
    
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
    var ExertMessageBox = function(type, options) {
        this.$type              = null;
        //if messagebox type was not is available types we do not do anything
        if ( ! OPTIONS.modalClasses.hasOwnProperty(type)){
            return null;
        }
        this.$type = OPTIONS.modalClasses[type];
        options = this._processInput(options);
        this.$options = $.extend({}, ExertMessageBox.DEFAULT_OPTIONS, options);
        this._init();
    };

    ExertMessageBox.prototype = {
        constructor: ExertMessageBox,
        
        _processInput : function(options) {
            if ( ! options || typeof options !== "object"){
                return {};
            }
            if (this.$type === 'confirm'){
                options.buttons = ['yes', 'no'];
                options.width = OPTIONS.modalSmallWidth;
                if ( ! options.footer){
                    options.footer = {};
                }
                options.footer.buttonsAlign = 'center';
            }
            if (options.buttons){
                var buttons = {};
                if (typeof options.buttons === 'object' && ! options.buttons.length) {
                    for (var i in options.buttons) {
                        buttons[i] = options.buttons[i];
                        buttons[i] = $.extend(buttons[i], options.buttons[i]);
                        var bs = OPTIONS.buttons[i];
                        for (var j in bs){
                            if ( ! buttons[i].hasOwnProperty(j)){
                                buttons[i][j] = bs[j];
                            }
                        }
                    }
                }else if (options.buttons.length > 0){
                    for (var i=0; i<options.buttons.length; i++){
                        buttons[options.buttons[i]] = OPTIONS.buttons[options.buttons[i]];
                    }
                    options.buttons = buttons;
                }
            }
            if (typeof options.title === 'string'){
                options.title = {
                    text    : options.title
                };
            }
            for (var i in OPTIONS.title){
                if ( ! options.title.hasOwnProperty(i)){
                    options.title[i] = OPTIONS.title[i];
                }
            }
            
            return options;
        },
        _init : function() {
            var me = this;
            var exert = $('.modal.exert-modal');
            //if messagebox exists we show it, if it does not exist we create and than show it
            if (exert.length === 0){
                //We create all necessary div-s and put in each other as it's required
                exert = $('<div class="modal exert-modal" role="dialog"></div>');
                var dialog = $('<div class="modal-dialog"></div>');
                var content = $('<div class="modal-content"></div>');
                var header = $('<div class="modal-header"></div>');
                var body = $('<div class="modal-body"></div>');
                var footer = $('<div class="modal-footer"></div>');
                content.append(header);
                content.append(body);
                content.append(footer);
                dialog.append(content);
                exert.append(dialog);
                $('body').append(exert);
            }
            //remove any alert type classes (such as "error", "success") from alert 
            for (var i=0; i<OPTIONS.modalClasses.length; i++){
                exert.removeClass(OPTIONS.modalClasses[i]);
            }
            //add corresponding class(es) to type
            exert.addClass(me.$type);
            me.$referer = exert;
            
            me._addAttrsAndClasses(me.$options.modal['class'], me.$options.modal.attrs, me.$referer);
            me._addHeader();
            if (me.$options.buttons && !$.isEmptyObject(me.$options.buttons)){
                me._addFooter();
            }else{
                footer.remove();
            }
            
            if (this.$options.msg) {
                if (!body){
                    var body = me.$referer.find('.modal-body');
                }
                body.html(me.$options.msg);
            }
            if ( ! me.$options.backDrop){
                exert.attr('data-backdrop', 'static');
            }
            
            me._givePosition();
            me._giveWidth();
            me._addShowListener();
            me._addAfterHideListener();
            exert.modal();
        },
        _addShowListener : function(){
            var me = this;
            me.$referer.on('show.bs.modal', function() {
                $('body').addClass(OPTIONS.bodyClass);
            });
        },
        _addAfterHideListener: function(){
            //We remove messagebo from DOM after it was hidden
            var me = this;
            me.$referer.on('hidden.bs.modal', function() {
                me.$referer.remove();
                $('body').removeClass(OPTIONS.bodyClass);
            });
        },
        hide   : function(){
            this.$referer.modal('hide');
        },
        _giveWidth: function(){
            var s = this.$options.width;
            if (!s)
                return;
            var d = this.$referer.find('.modal-dialog');
            if (isNaN(parseFloat(s, 10))){
                if (s === 'small')
                    d.addClass('modal-sm');
                else if (s === 'large')
                    d.addClass('modal-lg');
            }else{
                var px = parseFloat(s, 10);
                d.css('width', px);
            }
        },
        _givePosition: function(){
            var me = this;
            var p = this.$options.position;
            var pp = p.split(' ');
            var c = this.$referer.find('.modal-dialog');
            if (pp[1] === 'middle'){
                this.$referer.on('shown.bs.modal', function() {
                    var top = ($(window).height() - c.height()) / 2;
                    c.css('top', top);
                });
            }else if (pp[1] === 'bottom'){
                this.$referer.on('shown.bs.modal', function() {
                    var top = ($(window).height() - c.height()) - me.$options.topBottomOffset;
                    c.css('top', top);
                });
            }else{
                c.css('top', me.$options.topBottomOffset);
            }
        },
        _addAttrsAndClasses : function(cl, attrs, object){
            if (cl && typeof cl === 'string'){
                object.addClass(cl);
            }
            if (attrs && typeof attrs === 'object'){
                object.attr(attrs);
            }
            return object;
        },
        /*
         * This method adds title to modal with corresponding tags, classes and attributes
         * If class or attributes was given but tag was not given the title text is surrounded by <span></span> tags
         */
        _addTitle: function() {
            var header = this.$referer.find('.modal-header');
            var title = this.$options.title;
            if (! title)
                return;
            if (title.text) {
                var openTag = "<span>";
                var closeTag = "<span/>";
                if (title.tag) {
                    openTag = '<' + title.tag + '>';
                    closeTag = '</' + title.tag + '>';
                }
                var text = $(openTag + closeTag);
                this._addAttrsAndClasses(title['class'], title['attrs'], text);
                if (title.html) {
                    text.html(title.text);
                } else {
                    text.text(title.text);
                }
                header.append(text);
            }
        },
        _addHeader: function(){
            var me = this;
            var header = me.$referer.find('.modal-header');
            header.empty();
            if (me.$options.closeButton) {
                me._addCloseButton();
            }
            me._addTitle();
            me._addAttrsAndClasses(me.$options.header['class'], me.$options.header.attrs, header);
            
        },
        /**
         * This method adds close button to modal if it was enabled
         * 
         * @param {DomElement}  el      element which will be appended
         */
        _addCloseButton : function(){
            var header = this.$referer.find('.modal-header');
            header.append('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
        },
        /**
         * This method generates modal footer
         */
        _addFooter : function(){
            var footer = this.$referer.find('.modal-footer');
            footer.empty();
            if (['left', 'right', 'center'].indexOf(this.$options.footer.buttonsAlign) > -1){
                footer.addClass('text-'+this.$options.footer.buttonsAlign);
            }
            var buts = this._generateButtons();
            footer.append(buts);
        },
        _createButton : function(type, options){
            var me = this;
            var b = $('<button></button>');
            if (options.closeMessagebox) {
                b.attr('data-dismiss', 'modal');
            }
            if (this.$options.callback && typeof this.$options.callback === 'function') {
                b.on('click', function(e) {
                    me.$options.callback(me, type, e);
                });
            }
            b.html(options.text);
            return this._addAttrsAndClasses(options['class'], options.attrs, b);
        },
        /**
         * This method generates footer buttons with possible classes, attributes and callback method
         * 
         * @param {object}      options 
         * @return {array}                  array of buttons which we need to add in footer
         */
        _generateButtons : function(){
            var buttons = this.$options.buttons;
            var returnButtons = [];
            if (buttons && typeof buttons === 'object' && !$.isEmptyObject(buttons)){
                //here i is button type and buttons[i] is options for button
                for (var i in buttons){
                    returnButtons.push(this._createButton(i, buttons[i]));
//                    footer.append(createButton(i, buttons[i]));
                }
            }
            return returnButtons;
        }
    };

    //create exert object
    window.Exert = window.Exert || {};
    
    /*
     * This method shows message with type and with give options
     * 
     * @param string type of the messageBox
     * @param Object options
     * @returns void
     */
    window.Exert.messageBox = function(type, options) {
        if (type === 'prompt'){
            return new LobiboxPrompt(type, options);
        }else if (type === 'confirm'){
            return new LobiBoxConfirm(type, options);
        }
        else if (["success", "error", "warning", "info"].indexOf(type) > -1){
            return new LobiBoxInfo(type, options);
        }else{
            return new LobiBoxBase(type, options);
        }
    };

    

    ExertMessageBox.DEFAULT_OPTIONS = {
        //title may also be string withour any tag or class. If title is string html is true
        title: {
            text: '',                   //any string
            html: true,                 //if this option is set to true header title will show as HTML
            tag: '',                    //any valid html tag. Most likely you need to set only headings. h1,h2,h3,h4,h5,h6
            'class': '',                  //any valid css class
            attrs: {}                   //title tag attributes {key1: value1, key2: value2, ... ,keyN: valueN}
        },
        msg: '',
        closeButton: true,              //This will add close button in header
//        closeAction: 'hide',            //options: ['hide', 'destroy']
        //Position where the messagebox must be shown
        //avaibale options: ['center middle', 'center top', 'center bottom']
        position:    'center middle',
        //Size of the messagebox. Options: ['default', 'small', 'large']
        //You can also give number which is evaluated as in px
        width: 'default',
        topBottomOffset: 30,
        backDrop: false,                //This will prevent messagebox from hiding when you click outside
        /**
         *  buttons may be object  where key is button type and value is object like this
         *  cancel   : {
         *      class   : 'btn btn-default',
         *      attrs   : {},
         *      text    : 'Close',
         *  }
         */
        //it may be array also ['ok', 'calcel', 'yes', 'no'] 
//        buttons: ['cancel'],
        //modal corresponds to alert object
        modal: {
            'class': 'blur',
            attrs: {}
        },
        dialog: {
            'class': '',
            attrs: {}
        },
        content: {
            'class': '',
            attrs: {}
        },
        header: {
            'class': '',
            attrs: {}
        },
        body: {
            'class': '',
            attrs: {}
        },
        footer: {
            'class': '',
            attrs: {},
            buttonsAlign: 'right'    //we have three options 'right', 'center', 'left'
        }
    };

    var LOCALES = window.Exert.locales;
    var BUTTON_LOCALES = LOCALES.buttons;
    var OPTIONS = {
        bodyClass       : 'exert-open',
        modalSmallWidth: 250,
        modalClasses : {
            'error'     : 'exert-error',
            'success'   : 'exert-success',
            'info'      : 'exert-info',
            'warning'   : 'exert-warning',
            'confirm'   : 'exert-confirm',
            'progress'  : 'exert-progress'
        },
        title  : {
            'tag'       : 'h3',
            'class'     : 'modal-title',
            'html'      : true
        },
        buttons: {
            ok: {
                'class': 'btn btn-primary btn-sm',
                attrs: {},
                text: BUTTON_LOCALES.ok,
                closeMessagebox: false
            },
            cancel: {
                'class': 'btn btn-danger btn-sm',
                attrs: {},
                text: BUTTON_LOCALES.cancel,
                closeMessagebox: true
            },
            yes: {
                'class': 'btn btn-success btn-sm',
                attrs: {},
                text: BUTTON_LOCALES.yes,
                closeMessagebox: false
            },
            no: {
                'class': 'btn btn-default btn-sm',
                attrs: {},
                text: BUTTON_LOCALES.no,
                closeMessagebox: true
            }
        }
    };
})();

