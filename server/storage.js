var config = require('./config'),
    Schema = require('jugglingdb').Schema,
    schema = new Schema(config.storageType, config.storageOptions);

// entities
var User = schema.define('User', {
    name:       { type: String, index: true },
    password:   String,
    dateCreated: { type: Date, default: function () { return new Date(); } }
});

var Project = schema.define('Project', {
    name: String    
});

var TimeEntry = schema.define('TimeEntry', {
    date: String, // in format "YYYY.MM.DD"
    hours: Number
});

// relationships
User.hasMany(Project, { as: 'projects', foreignKey: 'userId' });
Project.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Project.hasMany(TimeEntry, { as: 'timeentries', foreignKey: 'projectId' });
TimeEntry.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// exports
module.exports = {
    User: User,
    Project: Project,
    TimeEntry: TimeEntry
}