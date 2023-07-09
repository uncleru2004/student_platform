import FetchWrapper from "./fetch-wrapper.js";

const form = document.querySelector("#studentForm");
const firstName = form.querySelector("#firstName");
const surname = form.querySelector("#surname");
const address = form.querySelector("#address");
const age = form.querySelector("#age");
const buttonMain = form.querySelector("#mainFormBtn");

const studentData = document.querySelector("#studentData");

const dialog = document.querySelector(".update_modal");
const dialogForm = dialog.querySelector("#studentForm__update");
const buttonDialog = dialog.querySelector("#updateFormBtn");

const global = {
    apiURL: 'http://localhost:3000/students/',
    endpoint: '',
};

let selectedRow; // переменная под выбранный ряд


// Заполнение формы и отправка данных
form.addEventListener("submit", event => {
    event.preventDefault();

    const student = {
        firstName: firstName.value,
        surname: surname.value,
        address: address.value,
        age: age.value,
    }
    
    tranferDataToServer(student); // Отправка данных на сервер
    
    form.reset(); // сброс значений формы
    
    buttonMain.disabled = true; // деактивация кнопки
    
    window.location.reload() // перезагрузка страницы
});

// Отправка данных на сервер
function tranferDataToServer (student) {
        
    const API = new FetchWrapper(`${global.apiURL}`);
    API.post(global.endpoint, student);
};

// Получение данных с сервера
function getDataFromServer() {
    const API = new FetchWrapper(`${global.apiURL}`);
    API.get(global.endpoint).then((data) => {
        
        appendToDOM(data); // Отрисовка данных в таблице
    });
};


// Отрисовка данных в таблице
function appendToDOM(students) {
   
    students.forEach(student => {
    const tr = document.createElement("tr");
    tr.id = student.id;
    
    tr.innerHTML = `
        <th>${student.firstName}</th>
		<th>${student.surname}</th>
		<th>${student.address}</th>
		<th>${student.age}</th>
        <th>
            <button class="delete-btn cross-btn">
                <svg class="modal__cross" xmlns="http://www.w3. org/2000/svg" viewBox="0 0 24 24">
                    <path class="modal___cross"
                    d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
                </svg>
            </button>
        </th>
    `;

    studentData.append(tr);
   });
}

// Удаление или изменение данных
studentData.addEventListener("click", event => {
    
    const cross = document.querySelector(".cross-btn");
    
    let clickedRaw = event.target.closest("tr"); // получаем родительский ряд
    
    // Если клик по кнопке удаления, удаляем ряд и отправляем запрос на сервер 
    if (cross.contains(event.target)) {
               
        clickedRaw.remove();
        
        deleteDataFromServer(clickedRaw.id); // удаление данных с сервера
    } 
    
    // Если клик просто по ряду, получаем все значения из ячеек  и открываем модальное окно для редактирования
    else {  
        const ths = clickedRaw.querySelectorAll("th");
        let values = [];
        ths.forEach(th => {
            values.push(th.innerText)// формируем массив данных из ячеек
        })
        
        selectedRow = clickedRaw; // помещаем в переменную "кликнутый" ряд

        updateStudentData(values); // редактируем данные
    }
})


/* Удаление данных
function deleteDataFromServer(id) {
    const API = new FetchWrapper(`${global.apiURL}`);
    API.delete(id, {});
}*/

// Удаление данных с сервера
async function deleteDataFromServer(id) {
    try {
        const response = await fetch(`http://localhost:3000/students/${id}`, {
          method: 'DELETE',
        });
    
        if (!response.ok) {
          throw new Error('Failed to delete the student');
        }    
        
    } catch (error) {
        console.error(error);
    }
}

// Функция изменения данных
function updateStudentData(values) {
    
    dialog.showModal(); // открываем форму в модальном окне
    
    // Заполняем поля ввода переданными из "кликнутого" ряда значениями
    const firstName = dialogForm.querySelector("#firstName");
    const surname = dialogForm.querySelector("#surname");
    const address = dialogForm.querySelector("#address");
    const age = dialogForm.querySelector("#age");

    firstName.value = values[0];
    surname.value = values[1];
    address.value = values[2];
    age.value = values[3];    
    
    disableButton(dialogForm); // активация/деактивация кнопки
};

// Редактирование полей формы в модальном окне и отправка обновленных данных на сервер
dialogForm.addEventListener("submit", event => {
    event.preventDefault();
    
    // Заполняем объект обновленными данными
    const newStudent = {
        firstName: dialogForm.querySelector("#firstName").value,
        surname: dialogForm.querySelector("#surname").value,
        address: dialogForm.querySelector("#address").value,
        age: dialogForm.querySelector("#age").value,
    }
    
    updateDataOnServer(newStudent, selectedRow.id); // отправка обновленных данных на сервер

});


/* Изменение данных на сервере
function updateDataOnServer(student, id) {
    const API = new FetchWrapper(`${global.apiURL}`);
    API.put(id, student);
    
    dialog.close();
}*/

//Изменение данных на сервере
async function updateDataOnServer(newStudent, id) {        
    try {
      const response = await fetch(`http://localhost:3000/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });
    
      if (response.ok) {
        updateDisplayedValues(newStudent, id); // Обновляем отредактированный ряд в таблице
      }  
      
      else {
        throw new Error('Failed to submit the form');
      }
        
    } catch (error) {
        console.error(error);
    }

    dialog.close(); // закрытие модального окна 
    buttonDialog.disabled = true;  // деактивация кнопки
};


// Обновление отредактированного ряда в таблице
function updateDisplayedValues(newStudent, id) {
    const raw = document.getElementById(`${id}`);

    const firstNameTh = raw.querySelector("th:nth-child(1)");
    const surnameTh = raw.querySelector("th:nth-child(2)");
    const addressTh = raw.querySelector("th:nth-child(3)");
    const ageTh = raw.querySelector("th:nth-child(4)");

    firstNameTh.textContent = newStudent.firstName;
    surnameTh.textContent = newStudent.surname;
    addressTh.textContent = newStudent.address;
    ageTh.textContent = newStudent.age;   
};



// Обработка клика вне модального окна для его закрытия
const modalCross = dialog.querySelector(".cross-btn");

dialog.addEventListener("click", (e) => {
  
  if (e.target === e.currentTarget || modalCross.contains(e.target)) {
    dialog.close(); // закрытие модального окна
    buttonDialog.disabled = true; // деактивация кнопки
  };  
});

// Функция активации/деактивации кнопки "Передать"
function disableButton(HTMLElement) {
    
    const firstName = HTMLElement.querySelector("#firstName");
    const surname = HTMLElement.querySelector("#surname");
    const address = HTMLElement.querySelector("#address");
    const age = HTMLElement.querySelector("#age");
    const button = HTMLElement.querySelector(".btn");

    HTMLElement.addEventListener("input", () => {
    
    if (firstName.value && surname.value && address.value && age.value) {
        button.disabled = false;
    }
    else {
        button.disabled = true;
    }
});
}

disableButton(form); // Инициируем функцию активации/деактивации кнопки "Передать"

// Загрузка и отрисовка данных в таблице 
document.addEventListener("DOMContentLoaded", getDataFromServer);