
import { Meteor }     from 'meteor/meteor';
import { FS }         from 'meteor/cfs:base-package';

/**
 * Подписка на файлы определенной коллекции
 */
Meteor.publish("ksrvFileUploader", function(collectionName, fileId){
    var collection = FS._collections[collectionName];
    if(!collection){
        throw new Meteor.Error(404, 'collection '+ collectionName + ' not found');
    }
    return collection.find({ _id: fileId });
});

Meteor.methods({
    /**
     * Удаление файла
     */
    ksrvFileUploader_remove: function(collectionName, fileId, callback){

        var collection = FS._collections[collectionName];

        if(!collection){
            throw new Meteor.Error(404, 'Collection not found');
        }

        var file = collection.findOne({_id: fileId});
        if(!file){
            throw new Meteor.Error(404, 'File not found');
        }

        if(file.owner && file.owner !== Meteor.userId()){
            throw new Meteor.Error(403, 'Access denied');
        }

        collection.remove({ _id: fileId });

        callback && callback(fileId);
    }
});
