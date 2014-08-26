var AmpersandView = require('ampersand-view');
var domify = require('domify');
var AvatarCropper = require('avatar-cropper-view');
var SnapshotView = require('ampersand-webcam-snapshot-view');
var dom = require('ampersand-dom');

var ModalView = require('./modal-view');

var template = [
    '<div>',
    '  <div><img data-hook="preview"></div>',
    '  <span data-hook="label"></span>',
    '  <a data-hook="upload">Upload Picture</a>',
    '  <a data-hook="snapshot">Take Picture</a>',
    '</div>'
].join('\n');


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
        'click [data-hook~=snapshot]' : 'openSnapshotModal',
        'click [data-hook~=upload]' : 'openUploadDialog'
    },

    props: {
        model: 'state',
        value: 'string'
    },

    bindings: {
        value: {
            type: 'attribute',
            hook: 'preview',
            name: 'src'
        }
    },

    initialize: function (opts) {
        if (!opts.name) throw new Error('name is required');
        this.render();
        this.name = opts.name;
        this.parent = opts.parent;

        if (opts.value) {
            this.value = opts.value;
            this.valid = true;
        } else {
            this.valid = false;
        }
    },

    createFileInput: function () {
        if (!this.fileInput) {
            this.fileInput = document.createElement('input');
            dom.setAttribute(this.fileInput, 'type', 'file');
            this.fileInput.style.display = 'none';
            this.el.appendChild(this.fileInput);
        }
    },

    openUploadDialog: function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.createFileInput();
        this.fileInput.click();
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
            this.parent.update(this);
        }.bind(this));

        this.listenTo(this.modal, 'hide', function (image) {
            this.modal.remove();
            this.modal = null;
            this.stopListening(this.modal);
        }.bind(this));

        this.modal.show();
    },

    beforeSubmit: function () {}
});

module.exports = ImageCropperView;
