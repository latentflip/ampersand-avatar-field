var AmpersandView = require('ampersand-view');
var domify = require('domify');
var AvatarCropper = require('avatar-cropper-view');
var SnapshotView = require('ampersand-webcam-snapshot-view');
var dom = require('ampersand-dom');

var template = [
    '<label>',
    '  <div><img role="preview"></div>',
    '  <span role="label"></span>',
    '  <input type="file">',
    '  <a role="snapshot">Take Picture</a>',
    '</label>'
].join('\n');

var modalTemplate = [
    '<div class="modal">',
    '  <div role="content"></div>',
    '  <button role="save">Save</button>',
    '</div>'
].join('\n');

var ModalView = AmpersandView.extend({
    template: modalTemplate,
    events: {
        'click [role=save]' : 'save'
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
        this.renderSubview(this.contentView, this.getByRole('content'));
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

var CropperModal = ModalView.extend({
    contentViewClass: AvatarCropper,
    save: function () {
        this.trigger('image', this.contentView.getCroppedImage());
        this.hide();
    }
});

var SnapshotModal = ModalView.extend({
    contentViewClass: SnapshotView,
    save: function () {
        this.trigger('image', this.contentView.takeSnapshot());
        this.hide();
    }
});

var ImageCropperView = AmpersandView.extend({
    template: template,
    events: {
        'change input[type=file]' : 'changeImage',
        'click [role=snapshot]' : 'openSnapshotModal'
    },

    changeImage: function (e) {
        var reader = new FileReader();

        reader.onload = function (e) {
            this.openModal(CropperModal, {
                parent: this,
                src: e.target.result
            });
        }.bind(this);

        reader.readAsDataURL(e.target.files[0]);
    },

    openSnapshotModal: function (e) {
        e.preventDefault();
        this.openModal(SnapshotModal);
    },

    openModal: function (Type, opts) {
        this.modal = new Type({
            contentViewOptions: opts||{}
        });

        this.listenTo(this.modal, 'image', function (image) {
            this.value = image;
            this.valid = true;
            this.updatePreview();
            this.parent.update(image);
        }.bind(this));

        this.listenTo(this.modal, 'hide', function (image) {
            this.modal.remove();
            this.modal = null;
            this.stopListening(this.modal);
        }.bind(this));

        this.modal.show();
    },

    initialize: function (opts) {
        if (!opts.name) throw new Error('name is required');
        this.render();
        this.name = opts.name;
        this.parent = opts.parent;
        this.valid = false;
    },

    updatePreview: function () {
        this.getByRole('preview').src = this.value;
    },

    beforeSubmit: function () {}
});

module.exports = ImageCropperView;
