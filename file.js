
import { Meteor }     from 'meteor/meteor';
import { Template }   from 'meteor/templating';
import { AutoForm }   from 'meteor/aldeed:autoform';
import { FS }         from 'meteor/cfs:base-package';
import './file.html';


AutoForm.addInputType('file-uploader', {
    template: 'ksrvFileUploader',
    valueOut () { return this.val() }
});

var getCollection = function(name){
    return FS._collections[name] || window[name];
};

Template.ksrvFileUploader.onCreated(function(){
    if(!(this.data && this.data.atts)){
        if(!this.data.atts.collection){
            console.warn('Collection not defined');
        }else if(typeof this.data.atts.collection !== 'string'){
            console.warn('Collection must be defined as string');
        }
    }

    this.value = new ReactiveVar(this.data.value);
    this.cn = this.data.atts.collection;
    this.collection = getCollection(this.cn);

    /**
     * @todo попробовать AutoForm.updateTrackedFieldValue(template, fieldName)
     * для автосохранения
     */
    this.setFile = (file) => {
        let fileObj = this.collection.insert(new FS.File(file));
        this.value.set(fileObj._id);
    };

    /**
     * @todo make onError event
     * @todo попробовать AutoForm.updateTrackedFieldValue(template, fieldName)
     * для автосохранения
     */
    this.removeFile = (fileObj) => {
        Meteor.call('ksrvFileUploader_remove', this.cn, fileObj._id);
    };

    /**
     * On select file
     */
    this.autorun(() => {
        this.subscribe('ksrvFileUploader', this.cn, this.value.get());
    });

    this.file = () => {
        return  this.collection.findOne({ _id: this.value.get() });
    }
});

Template.ksrvFileUploader.onRendered(function(){
    $(`#${AutoForm.getFormId()}`).on('reset', () => {
        this.value.set(false);
    });
});

Template.ksrvFileUploader.helpers({
    file () {
        return Template.instance().file();
    },

    attr () {
        var atts = _.clone(this.atts);
        atts.value = Template.instance().value.get();
        atts.type = 'hidden';
        return _.pick(atts, 'id', 'name', 'type', 'data-schema-key', 'value');
    }
});

Template.ksrvFileUploader.events({
    'change [name=fileselect]': function(event, template){
        if(event.target.files.length){
            template.setFile(event.target.files[0]);
        }
    },

    'click [name=remove]': function(event, template){
        template.removeFile(this);
    },
});

Template.ksrvFileUploaderAddButton.helpers({
    attr () {
        var atts = _.clone(this.atts);
        atts.name = 'fileselect';
        atts.type = 'file';
        return _.pick(atts, 'type', 'name', 'accept');
    }
});

Template.ksrvFileUploaderPreviewFile.helpers({
    icon () {
        switch (this.extension()) {
            case 'pdf':
                return 'file-pdf-o';

            case 'doc':
            case 'docx':
            case 'odt':
                return 'file-word-o';

            case 'xls':
            case 'xlsx':
            case 'ods':
                return 'file-excel-o';

            case 'ppt':
            case 'odp':
                return 'file-powerpoint-o';

            case 'avi':
            case 'mov':
            case 'mp4':
                return 'file-movie-o';

            case 'mp3':
            case 'waw':
                return 'file-audio-o';

            case 'html':
            case 'htm':
            case 'js':
            case 'php':
                return 'file-code-o';

            case 'zip':
            case 'rar':
            case 'gz':
            case 'tar':
            case '7z':
            case '7zip':
                return 'file-archive-o';

            default:
                return 'file-o';
        }
    }    
});
