// var SPM = SPM || {};
// SPM.Apps = SPM.Apps || {};
// SPM.Apps.CheckTrelloSlack = SPM.Apps.CheckTrelloSlack || {};

// SPM.Apps.CheckTrelloSlack.CheckTrelloSlackInitializer = {
//     init: function() {
//         SPM.Model.Project.ProjectManager.getMyProjectsInArborium().then(function(projects) {
//             if (projects.length > 0) {
//                 projectsWithoutSlack = _.filter(projects, function(project) {
//                     return !project.slack;
//                 });
//                 if (projectsWithoutSlack.length > 0) {
//                     var projectsList = _.reduce(projectsWithoutSlack, function(memo, project) {
//                         return memo + "- " + project.name + "\r\n";
//                     }, "");
//                     var msg = 'Vous avez ' + projectsWithoutSlack.length + ' projets qui n\'ont pas de discussion slack associées!\r\n\
// \r\n\
// Pour associer une discussion avec slack, vous devez rajouter dans la description une ligne:\r\n\
// **Slack**: #{nom de la discussion}\r\n\
// Avec un retour à la ligne en fin de ligne.\r\n\
// /!\\ Ne pas mettre de lien.\r\n\
// \r\n\
// Voici la liste des projets:\r\n\
// ' + projectsList;
//                     alert(msg);
//                 }


//             }
//         });
//     }
// }

