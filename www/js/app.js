"use strict"
const lancement = false;
// const lancement = true;

// App logic.
window.myApp = {};

document.addEventListener(`init`, function (event) {
  console.log(event);

  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.

    if (document.querySelector(`#menuPage`)

      && document.querySelector(`#todoTasksPage`)
      && !document.querySelector(`#todoTasksPage ons-list-item`)

      && document.querySelector(`#pendingTasksPage`)
      && !document.querySelector(`#pendingTasksPage ons-list-item`)

      && document.querySelector(`#completedTasksPage`)
      && !document.querySelector(`#completedTasksPage ons-list-item`)

      && document.querySelector(`#archivedTasksPage`)
      && !document.querySelector(`#archivedTasksPage ons-list-item`)
    ) {

      let initialised = window.localStorage.getItem("init");

      if (!initialised || lancement) {


        let date = new Date(Date.now());
        date.setDate(date.getDate() + 4);

        let liste = [
          {
            title: `S'enregistrer`,
            category: `Super important`,
            description: `Some description.`,
            highlight: false,
            urgent: false,
            state: 0,
            date: date
          }, {
            title: `Etre heureux`,
            category: `Personal`,
            description: `Some description.`,
            highlight: false,
            urgent: false,
            state: 0,
            date: date
          }, {
            title: `C'est perso`,
            category: `Personal`,
            description: `Coucou.`,
            highlight: true,
            urgent: false,
            state: 0,
            date: date
          }
        ];

        let categories = ["Super important", "Personal"]

        console.log("First use");
        window.localStorage.clear();

        window.localStorage.setItem("init", true);
        window.localStorage.setItem("liste", JSON.stringify(liste));
        window.localStorage.setItem("catégories", JSON.stringify(categories));

      }

      let listeTache = window.localStorage.getItem("liste");
      if (listeTache != "") {

        let listeTacheParse = JSON.parse(listeTache);
        listeTacheParse.forEach(function (data) {
          myApp.services.tasks.create(data);
        });
      } else {
        ons.notification.toast("Créez de nouvelles tâches", { timeout: 3000, animation: 'fall' });

      }



      // myApp.services.fixtures.forEach(function (data) {
      //   myApp.services.tasks.create(data);
      // });
    } else {
      console.log("3");

    }
  }
});
