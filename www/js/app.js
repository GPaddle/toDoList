"use strict"
const lancement = false;
// const lancement = true;

// App logic.
window.myApp = {};

document.addEventListener(`init`, function (event) {
  // console.log(event);

  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.

  //WARNING
  //Ecrire ici la dernière ressource à charger ici 
  if (page.id === `menuPage`
    || page.id === `todoTasksPage`
    || page.id === `pendingTasksPage`
    || page.id === `completedTasksPage`
    || page.id === `archivedTasksPage`) {

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
        window.localStorage.setItem("archiveAuto", true);

      }

      let listeTache = window.localStorage.getItem("liste");
      if (listeTache != "") {

        const isToday = function (date) {
          let today = new Date();
          let dateTest = new Date(date);

          return dateTest.getDate() == today.getDate() &&
            dateTest.getMonth() == today.getMonth() &&
            dateTest.getFullYear() == today.getFullYear()
        }

        let listeTacheParse = JSON.parse(listeTache);
        listeTacheParse.forEach(function (data) {

          if (isToday(data.date) && (data.state == 0 || data.state == 1)) {
            ons.notification.alert(`${data.title} va expirer aujourd'hui`, { cancelable: true, title: "Bientôt terminé ?" });
          }

          myApp.services.tasks.create(data);
        });
      } else {
        ons.notification.toast("Créez de nouvelles tâches", { timeout: 3000, animation: 'ascend' });
      }

      let archiveAuto = window.localStorage.getItem("archiveAuto");

      let valeur = archiveAuto === "true" ? true : false;
      document.querySelector("#archiveAuto").checked = valeur;

      if (valeur) {
        myApp.services.tasks.majDatePassee();
      }




      // Drag N Drop adds




      const draggables = document.querySelectorAll('.draggable')
      const containers = document.querySelectorAll('.container')

      draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
          draggable.classList.add('dragging')
        })

        draggable.addEventListener('dragend', () => {
          draggable.classList.remove('dragging')
        })
      })

      containers.forEach(container => {
        container.addEventListener('dragover', e => {
          e.preventDefault()
          console.log(e);

          const afterElement = getDragAfterElement(container, e.clientY)
          const draggable = document.querySelector('.dragging')
          if (afterElement == null) {
            container.appendChild(draggable)
          } else {
            container.insertBefore(draggable, afterElement)
          }
        })
      })

      function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

        return draggableElements.reduce((closest, child) => {
          const box = child.getBoundingClientRect()
          const offset = y - box.top - box.height / 2
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
          } else {
            return closest
          }
        }, { offset: Number.NEGATIVE_INFINITY }).element
      }


    }
  }
});
