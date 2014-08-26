var AmpersandView = require('ampersand-view');
var dom = require('ampersand-dom');

var modalTemplate = [
    '<div class="modal">',
    '  <div data-hook="content"></div>',
    '  <button data-hook="save">Save</button>',
    '</div>'
].join('\n');

var ModalView = AmpersandView.extend({
    template: modalTemplate,
    events: {
        'click [data-hook~=save]' : 'save'
    },
    initialize: function (opts) {
        this.contentViewOptions = opts.contentViewOptions || {};
    },
    appendTo: function (targetEl) {
        targetEl.appendChild(this.el);
        this.attached = true;
    },
    render: function (opts) {
        this.renderWithTemplate({});
        this.contentView = new this.contentViewClass(this.contentViewOptions);
        this.renderSubview(this.contentView, this.queryByHook('content'));
        return this;
    },
    show: function () {
        if (!this.rendered) this.render();
        if (!this.attached) {
            if (!this.el.parentNode) this.appendTo(document.body);
            this.attached = true;
        }
        dom.show(this.el);
    },
    hide: function () {
        this.trigger('hide');
        dom.hide(this.el);
    }
});

module.exports = ModalView;
