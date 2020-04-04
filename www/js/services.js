"use strict"
/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

myApp.services = {

  /////////////////
  // Task Service //
  /////////////////
  tasks: {

    removeOneList: function (name) {
      document.querySelectorAll("#" + name + " ons-list-item").forEach(element => {
        myApp.services.tasks.remove(element);
        
        // console.log(element);
      });

    },

    removeAll: function () {

      myApp.services.tasks.removeOneList("todo-list");
      myApp.services.tasks.removeOneList("pending-list");
      myApp.services.tasks.removeOneList("completed-list");
      myApp.services.tasks.removeOneList("archived-list");

    },

    resetLists: function () {
      document.querySelector("#todo-list").innerHTML = "";
      document.querySelector("#pending-list").innerHTML = "";
      document.querySelector("#completed-list").innerHTML = "";
      document.querySelector("#archived-list").innerHTML = "";
    },

    majDatePassee: function () {
      //On filtre sur la date
      let listeLocStor = window.localStorage.getItem("liste");
      let contentList;
      if (listeLocStor) {
        contentList = JSON.parse(listeLocStor);
      } else {
        contentList = "";
      }


      if (contentList) {

        let today = new Date(Date.now());

        function condition(item) {
          return (new Date(item.date) < today && item.state != 4);
        }

        let i = contentList.findIndex(e => condition(e));

        while (i != -1) {
          contentList[i].state = 4;

          i = contentList.findIndex(e => condition(e));
        }
        window.localStorage.setItem("liste", JSON.stringify(contentList));

        myApp.services.tasks.resetLists();

        JSON.parse(window.localStorage.getItem("liste")).forEach(element => {
          myApp.services.tasks.create(element);
        });

      }
    },

    // Creates a new task and attaches it to the pending task list.
    create: function (data) {


      let currentClass = "current";
      let icones = ["fa-clipboard-list", "fa-running", "fa-check"];

      let state0 = data.state == 0 ? currentClass : "";
      let state1 = data.state == 1 ? currentClass : "";
      let state2 = data.state == 2 ? currentClass : "";

      // Task item template.
      var taskItem = ons.createElement(
        `<ons-list-item tappable category="${myApp.services.categories.parseId(data.category)}"> 
          
          <label class="left">
            <ons-button modifier="quiet" id="b0" class="${state0}">
              <ons-icon icon="${icones[0]}"></ons-icon>
            </ons-button>  
          </label>

          <label class="left">
            <ons-button modifier="quiet" id="b1" class="${state1}">
              <ons-icon icon="${icones[1]}"></ons-icon>
            </ons-button>  
          </label>

          <label class="left">
            <ons-button modifier="quiet" id="b2" class="${state2}">
              <ons-icon icon="${icones[2]}"></ons-icon>
            </ons-button>  
          </label>

          <div class="center">
            ${data.title}
          </div>
          <div class="right">
           <ons-icon id="trash" style="color: red; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>
          </div>
        </ons-list-item>`
      );



      // Store data within the element.
      taskItem.data = data;

      let boutons = taskItem.querySelectorAll("ons-button");

      boutons.forEach(element => {
        element.addEventListener("click", function () {
          boutonListener(event);
        })
      });


      function boutonListener(event) {

        let classList;
        try {
          classList = event.target.children[1].classList;
        } catch (error) {
          classList = event.target.classList;
        }


        let boutons = taskItem.querySelectorAll("ons-button");
        boutons.forEach(element => {
          if (element.classList.contains(currentClass)) {
            element.classList.remove(currentClass);
          }
        });

        let iconesListe = taskItem.querySelectorAll("ons-icon");
        iconesListe.forEach(element => {
          if (element.classList.contains(currentClass)) {
            element.classList.remove(currentClass);
          }
        });

        let target = event.target;
        if (target.tagName === "ONS-ICON") {
          target = event.target.parentElement;
        }

        if (classList.contains(icones[0])) {
          // console.log("0");
          target.classList.add(currentClass);
          myApp.services.animators.swipe(taskItem, event, function () {
            change(0)
          })
        } else if (classList.contains(icones[1])) {
          // console.log("1");
          target.classList.add(currentClass);
          myApp.services.animators.swipe(taskItem, event, function () {
            change(1)
          })
        } else if (classList.contains(icones[2])) {
          // console.log("2");
          target.classList.add(currentClass);
          myApp.services.animators.swipe(taskItem, event, function () {
            change(2)
          })

        }


      };

      function change(int) {
        let listId = `todo-list`;

        switch (int) {
          case 1:
            listId = `pending-list`;
            break;
          case 2:
            listId = `completed-list`;
            break;
        }

        let localStor = JSON.parse(window.localStorage.getItem("liste"));

        // console.log(localStor)

        localStor.forEach(element => {
          if (element.title == data.title) {
            if (element.state != int) {
              element.state = int;
              data.state = int;
            }
          }
        });

        window.localStorage.setItem("liste", JSON.stringify(localStor));

        document.querySelector("#" + listId).appendChild(taskItem);
      }

      // Add button functionality to remove a task.
      taskItem.querySelector(`#trash`).onclick = function () {
        myApp.services.tasks.remove(taskItem);
      };

      // Add functionality to push `details_task.html` page with the current element as a parameter.
      taskItem.querySelector(`.center`).onclick = function () {
        document.querySelector(`#myNavigator`)
          .pushPage(`html/details_task.html`,
            {
              animation: `lift`,
              data: {
                element: taskItem
              }
            }
          );
      };

      // Check if it`s necessary to create new categories for this item.
      myApp.services.categories.updateAdd(taskItem.data.category);

      // Add the highlight if necessary.
      if (taskItem.data.highlight) {
        taskItem.classList.add(`highlight`);
      }

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      let todoList
      switch (data.state) {
        case 0:
          todoList = document.querySelector(`#todo-list`)
          break;
        case 1:
          todoList = document.querySelector(`#pending-list`)
          break;
        case 2:
          todoList = document.querySelector(`#completed-list`)
          break;
        case 4:
          todoList = document.querySelector(`#archived-list`);
          //TODO ;
          //Souvent des problèmes avec le chargement de la page archives ...
          break;

        default:
          throw console.error("Combien ? PB state dans data " + data.state);

          break;
      }

      todoList ? todoList.insertBefore(taskItem, taskItem.data.urgent ? todoList.firstChild : null) : console.error("problème avec le query selector : " + todoList);

      //var pendingList = document.querySelector(`#pending-list`);
      //pendingList.insertBefore(taskItem, taskItem.data.urgent ? pendingList.firstChild : null);
    },

    // Modifies the inner data and current view of an existing task.
    update: function (taskItem, data) {
      // console.log("TODO : regarder dans update, parfois PB");

      let localStorageList = JSON.parse(window.localStorage.getItem("liste"));

      // console.log(taskItem);
      // console.log("" + (window.localStorage.getItem("liste")));
      // console.log("" + localStorageList);



      if (data.title !== taskItem.data.title) {
        // Update title view.
        taskItem.querySelector(`.center`).innerHTML = data.title;
      }

      const i = localStorageList.findIndex(e => e.title === taskItem.data.title);
      // update the element

      if (data.state == 4) {
        this.remove(taskItem);
        this.create(taskItem);
      }

      localStorageList[i] = data;


      window.localStorage.setItem("liste", JSON.stringify(localStorageList));

      if (data.category !== taskItem.data.category) {
        // Modify the item before updating categories.
        taskItem.setAttribute(`category`, myApp.services.categories.parseId(data.category));
        // Check if it`s necessary to create new categories.
        myApp.services.categories.updateAdd(data.category);
        // Check if it`s necessary to remove empty categories.
        myApp.services.categories.updateRemove(taskItem.data.category);

      }

      // Add or remove the highlight.
      taskItem.classList[data.highlight ? `add` : `remove`](`highlight`);

      // Store the new data within the element.
      taskItem.data = data;
    },

    // Deletes a task item and its listeners.
    remove: function (taskItem) {
      taskItem.removeEventListener(`change`, taskItem.data.onCheckboxChange);

      myApp.services.animators.remove(taskItem, function () {
        // Remove the item before updating the categories.
        taskItem.remove();

        // console.log(window.localStorage.getItem("liste"));
        

        if (window.localStorage.getItem("liste")) {
          let list = JSON.parse(window.localStorage.getItem("liste"));
          const i = list.findIndex(e => e.title === taskItem.data.title);
          // console.log(i);
          // update the element
  
          //On le retire de la liste
          list.splice(i, 1);
  
          window.localStorage.setItem("liste", JSON.stringify(list));
  
          // Check if the category has no items and remove it in that case.
          myApp.services.categories.updateRemove(taskItem.data.category);
        }

      });
    }
  },

  /////////////////////
  // Category Service //
  ////////////////////
  categories: {

    // Creates a new category and attaches it to the custom category list.
    create: function (categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);

      // Category item template.
      var categoryItem = ons.createElement(
        `<ons-list-item tappable category-id="${categoryId}">
          <div class="left">
            <ons-radio name="categoryGroup" input-id="radio-${categoryId}"></ons-radio>
          </div>
          <label class="center" for="radio-${categoryId}">` +
        (categoryLabel || `No category`) +
        `</label>
        </ons-list-item>`
      );

      let categories = JSON.parse(window.localStorage.getItem("catégories"));
      if (categories) {
        if (!categories.includes(categoryLabel)) {
          categories.push("" + categoryLabel);
        }
      } else {
        categories = "" + categoryLabel;
      }
      window.localStorage.setItem("catégories", JSON.stringify(categories));






      // http://appmobiles/toDoList/www/

      // Adds filtering functionality to this category item.
      myApp.services.categories.bindOnCheckboxChange(categoryItem);

      // Attach the new category to the corresponding list.
      document.querySelector(`#custom-category-list`).appendChild(categoryItem);
    },

    // On task creation/update, updates the category list adding new categories if needed.
    updateAdd: function (categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector(`#menuPage ons-list-item[category-id="` + categoryId + `"]`);

      if (!categoryItem) {
        // If the category doesn`t exist already, create it.
        myApp.services.categories.create(categoryLabel);
      }
    },

    // On task deletion/update, updates the category list removing categories without tasks if needed.
    updateRemove: function (categoryLabel) {

      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector(`#tabbarPage ons-list-item[category="` + categoryId + `"]`);

      if (!categoryItem) {
        // If there are no tasks under this category, remove it.
        myApp.services.categories.remove(document.querySelector(`#custom-category-list ons-list-item[category-id="` + categoryId + `"]`));



        let categories = JSON.parse(window.localStorage.getItem("catégories"));

        //On cherche l'index à retirer : on compare l'ID
        //On utilise la version parsé (sans majuscule ni espace)
        const i = categories.findIndex(e => myApp.services.categories.parseId(e) === categoryId);
        // console.log(i);
        //On le retire de la liste
        categories.splice(i, 1);

        // console.log(categories);
        

        //On remet l'objet dans le champ catégorie
        window.localStorage.setItem("catégories", JSON.stringify(categories));



      }
    },

    // Deletes a category item and its listeners.
    remove: function (categoryItem) {
      if (categoryItem) {
        // Remove listeners and the item itself.
        categoryItem.removeEventListener(`change`, categoryItem.updateCategoryView);
        categoryItem.remove();
      }
    },

    // Adds filtering functionality to a category item.
    bindOnCheckboxChange: function (categoryItem) {
      var categoryId = categoryItem.getAttribute(`category-id`);
      var allItems = categoryId === null;

      categoryItem.updateCategoryView = function () {
        var query = `[category="` + (categoryId || ``) + `"]`;

        var taskItems = document.querySelectorAll(`#tabbarPage ons-list-item`);
        for (var i = 0; i < taskItems.length; i++) {
          taskItems[i].style.display = (allItems || taskItems[i].getAttribute(`category`) === categoryId) ? `` : `none`;

          if ((allItems || taskItems[i].getAttribute(`category`) === categoryId)) {

            //            console.log(taskItems[i]);
          }

        }
        // console.log("----------------");

      };

      categoryItem.addEventListener(`change`, categoryItem.updateCategoryView);
    },

    // Transforms a category name into a valid id.
    parseId: function (categoryLabel) {
      return categoryLabel ? categoryLabel.replace(/\s\s+/g, ` `).toLowerCase() : ``;
    }
  },

  //////////////////////
  // Animation Service //
  /////////////////////
  animators: {

    // Swipe animation for task completion.
    swipe: function (listItem, event, callback) {
      var animation = (event.target.checked) ? `animation-swipe-right` : `animation-swipe-left`;
      listItem.classList.add(`hide-children`);
      listItem.classList.add(animation);

      setTimeout(function () {
        listItem.classList.remove(animation);
        listItem.classList.remove(`hide-children`);
        callback();
      }, 950);
    },

    // Remove animation for task deletion.
    remove: function (listItem, callback) {
      // console.log(listItem);
      
      listItem.classList.add(`animation-remove`);
      listItem.classList.add(`hide-children`);

      setTimeout(function () {
        callback();
      }, 750);
    }
  }

};
