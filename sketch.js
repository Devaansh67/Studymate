var homework = [];

var homeworkLevel = 1;
var homeworkXp = 0;
var xpPerCompletedHomework = 100;
var homeworkStorageKey = "studymate.data.v1";

function showStorageError(message) {
    var status = document.getElementById("storageStatus");
    status.innerText = message;
    status.hidden = false;
}

function isValidSavedHomework(task) {
    return task &&
        typeof task.title === "string" &&
        typeof task.subject === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(task.date) &&
        ["Low", "Medium", "High"].includes(task.priority) &&
        typeof task.notes === "string" &&
        typeof task.completed === "boolean";
}

function loadSavedHomework() {
    var savedData;

    try {
        savedData = localStorage.getItem(homeworkStorageKey);
    } catch (error) {
        showStorageError("Saved homework is unavailable. Check this browser's storage settings.");
        return;
    }

    if (savedData === null) {
        return;
    }

    try {
        var data = JSON.parse(savedData);
        var isValid = data &&
            Array.isArray(data.homework) &&
            data.homework.every(isValidSavedHomework) &&
            Number.isInteger(data.homeworkLevel) &&
            data.homeworkLevel >= 1 &&
            Number.isInteger(data.homeworkXp) &&
            data.homeworkXp >= 0 &&
            data.homeworkXp < 1000;

        if (!isValid) {
            showStorageError("Saved homework data is invalid and could not be loaded.");
            return;
        }

        homework = data.homework;
        homeworkLevel = data.homeworkLevel;
        homeworkXp = data.homeworkXp;
    } catch (error) {
        showStorageError("Saved homework data could not be read.");
    }
}

function saveHomeworkData() {
    var data = {
        homework: homework,
        homeworkLevel: homeworkLevel,
        homeworkXp: homeworkXp
    };

    try {
        localStorage.setItem(homeworkStorageKey, JSON.stringify(data));
        var status = document.getElementById("storageStatus");
        status.hidden = true;
        status.innerText = "";
    } catch (error) {
        showStorageError("Could not save homework. Check available browser storage.");
    }
}

loadSavedHomework();



var currentDate = new Date()
var currentMonth = currentDate.getMonth()
var currentYear = currentDate.getFullYear()
var selectedCalendarDate = null;
var monthNames = ["January", "February", "March" , "April" , "May" , "June" , "July" , "August" , "September" , "October" , "November" , "December"];
console.log(currentMonth)

function createCalender(){
    var calender = document.getElementById("calendar");
    var monthYear = document.getElementById("monthYear");
    
    // clear old dates
    calender.innerHTML = ""

    var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (var day of days){
        var dayName = document.createElement("div");
        dayName.classList.add("day-name");
        dayName.innerText = day;
        calender.appendChild(dayName)
    }

    // show month and year
    monthYear.innerText = monthNames[currentMonth]+" "+currentYear;

    //find the first day of the month
    var firstDay = new Date(currentYear, currentMonth , 1);

    //find number of days in the month

    var numberOfDays = new Date(currentYear, currentMonth+1, 0).getDate();

    var startingDay = (firstDay.getDay() + 6) % 7;

    for (var i = 0; i < startingDay; i++){
        var emptyDay = document.createElement("div")
        emptyDay.classList.add("empty")
        calender.appendChild(emptyDay)
    }

   for (let day = 1; day <= numberOfDays; day++) {

    let dateElement = document.createElement("div");

    dateElement.classList.add("date");

    dateElement.innerText = day;


    // Create the date in YYYY-MM-DD format
    let month = currentMonth + 1;

    if (month < 10) {
        month = "0" + month;
    }

    if (day < 10) {
        day = "0" + day;
    }

    let selectedDate =
        currentYear + "-" + month + "-" + day;

    if (selectedDate === selectedCalendarDate) {
        dateElement.classList.add("selected");
    }

    if (selectedDate === getTodayDateString() &&
        (!selectedCalendarDate || selectedCalendarDate === selectedDate)) {
        dateElement.classList.add("today");
    }


    // When the date is clicked
    dateElement.addEventListener("click", function() {
        selectedCalendarDate = selectedDate;
        createCalender();
        showHomeworkForDate(selectedDate);
    });


    calendar.appendChild(dateElement);
}




}

function showHomeworkForDate(selectedDate) {

    let selectedDateHeading =
        document.getElementById("selectedDate");

    let selectedTasks =
        document.getElementById("selectedTasks");


    // Find homework for this date
    let tasksForDate = homework.filter(function(task) {

        return task.date === selectedDate;

    });


    // Convert 2026-08-12 into a nice date
    var dateParts = selectedDate.split("-");

    var year = dateParts[0];
    var month = Number(dateParts[1]);
    var day = Number(dateParts[2]);


    var dateObject = new Date(year, month - 1, day);


    var niceDate = dateObject.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );


    selectedDateHeading.innerText = niceDate;


    // If there is no homework
    if (tasksForDate.length === 0) {

        selectedTasks.innerHTML = `
            <p>No homework for this day 🎉</p>
        `;

        return;
    }


    // Clear old homework
    selectedTasks.innerHTML = "";


    // Display each homework task
    for (let task of tasksForDate) {

        var homeworkCard =
            document.createElement("div");

        homeworkCard.classList.add("homework-card");
        if (task.completed) {
            homeworkCard.classList.add("completed");
        }


       homeworkCard.innerHTML = `

            <div class="homework-top">

                <div class="homework-info">

                    <h3>${escapeHtml(task.title)}</h3>

                    <p>${escapeHtml(task.subject)}</p>

                    <p>🕐 Due today</p>

                </div>


                <div class="priority ${task.priority.toLowerCase()}">
                    ${escapeHtml(task.priority)}
                </div>  

            </div>


            <div class="homework-notes">

                📝 ${escapeHtml(task.notes)}

            </div>


            <div class="homework-actions">

                <button
                    class="complete-button"
                    ${task.completed ? "disabled" : ""}
                >
                    ${task.completed ? "✓ Completed" : "✓ Mark as Complete"}
                </button>

            </div>

        `;

        homeworkCard.querySelector(".complete-button").addEventListener("click", function() {
            completeHomework(task);
        });

        selectedTasks.appendChild(homeworkCard);
    }
}

function completeHomework(task) {
    if (!homework.includes(task)) {
        throw new Error("Cannot complete homework that is not in the homework list.");
    }

    if (task.completed) {
        return;
    }

    task.completed = true;
    homeworkXp += xpPerCompletedHomework;

    while (homeworkXp >= 1000) {
        homeworkXp -= 1000;
        homeworkLevel += 1;
    }

    saveHomeworkData();
    updateHeroProgress();
    updateHomeworkStats();
    displayUpcomingHomework();
    showHomeworkForDate(task.date);
}

function updateHeroProgress() {
    var progressBar = document.getElementById("heroProgressBar");
    var progressContainer = progressBar.parentElement;

    document.getElementById("heroLevel").innerText = "Level " + homeworkLevel;
    document.getElementById("heroXp").innerText = homeworkXp + " / 1000 XP";
    progressBar.style.width = (homeworkXp / 10) + "%";
    progressContainer.setAttribute("aria-valuenow", homeworkXp);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

var showAllHomework=false;
var viewAllHomeworkButton = document.getElementById("viewAllHomework");

viewAllHomeworkButton.addEventListener("click", function() {
    showAllHomework = !showAllHomework;
    viewAllHomeworkButton.innerText = showAllHomework ? "Show Upcoming" : "View All";
    displayUpcomingHomework();
});

function getTodayDateString() {
    return getDateString(new Date());
}

function getDateString(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();

    if (month < 10) {
        month = "0" + month;
    }

    if (day < 10) {
        day = "0" + day;
    }

    return date.getFullYear() + "-" + month + "-" + day;
}

function updateHomeworkStats() {
    var today = getTodayDateString();
    var lastDueSoonDate = new Date();
    lastDueSoonDate.setDate(lastDueSoonDate.getDate() + 6);
    var lastDueSoonDateString = getDateString(lastDueSoonDate);

    var totalCount = homework.length;
    var dueSoonCount = homework.filter(function(task) {
        return !task.completed &&
            task.date >= today &&
            task.date <= lastDueSoonDateString;
    }).length;
    var overdueCount = homework.filter(function(task) {
        return !task.completed && task.date < today;
    }).length;
    var completedCount = homework.filter(function(task) {
        return task.completed;
    }).length;

    document.getElementById("totalHomeworkCount").innerText = totalCount;
    document.getElementById("dueSoonCount").innerText = dueSoonCount;
    document.getElementById("overdueCount").innerText = overdueCount;
    document.getElementById("completedCount").innerText = completedCount;
}

function formatHomeworkDate(dateString) {

    let parts = dateString.split("-");

    let year = Number(parts[0]);
    let month = Number(parts[1]);
    let day = Number(parts[2]);

    let date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

}


function displayUpcomingHomework(){
    var homeworkList = document.getElementById("homeworkList");
    homeworkList.innerHTML = "";
    var today = getTodayDateString();
    var lastDate = new Date();
    lastDate.setDate(lastDate.getDate() + 6);
    var lastDateString = getDateString(lastDate);
    var taskShow = [];
    
    for(var task of homework){
        if(showAllHomework || (
            task.date >= today &&
            task.date <= lastDateString &&
            !task.completed
        )){
             taskShow.push(task);
        }
    }

    // Arrange homework by due date
    taskShow.sort(function(a, b) {
        return a.date.localeCompare(b.date);
    });


    // Display a message if the list is empty
    if (taskShow.length === 0) {

        homeworkList.innerHTML =
            "<p>No upcoming homework. You're all caught up! 🎉</p>";

        return;
    }

    for (let task of taskShow){
        var card = document.createElement("div");
        card.classList.add("upcoming-card");
        card.classList.add(task.completed ? "completed" : "incomplete");
        var subjectIcon = "📚";
        if (task.subject == "Mathematics") {
            subjectIcon = "📐";
        }
        else if(task.subject == "Science") {
            subjectIcon = "🔬";
        }
        else if(task.subject == "English"){
            subjectIcon = "🔠";
        }
        else if(task.subject == "Social Studies"){
            subjectIcon == "🗿";
        }
        else if(task.subject == "History"){
            subjectIcon = "🌍";
        }

        card.innerHTML = `

            <div class="upcoming-icon">
                ${subjectIcon}
            </div>

            <div class="upcoming-info">

                <h3>${escapeHtml(task.title)}</h3>

                <p>${escapeHtml(task.subject)}</p>

            </div>

            <div class="upcoming-date">

                <span>${formatHomeworkDate(task.date)}</span>

                <span class="priority ${task.priority.toLowerCase()}">
                    ${escapeHtml(task.priority)}
                </span>

            </div>

        `;


        // Clicking a card opens that homework date
        card.addEventListener("click", function() {

            let parts = task.date.split("-");

            currentYear = Number(parts[0]);
            currentMonth = Number(parts[1]) - 1;
            selectedCalendarDate = task.date;

            createCalender();

            showHomeworkForDate(task.date);

        });


        homeworkList.appendChild(card);

    }

}

var addHomeworkButton = document.getElementById("addHomeworkButton");
var homeworkDialog = document.getElementById("homeworkDialog");
var homeworkForm = document.getElementById("homeworkForm");

addHomeworkButton.addEventListener("click", function() {
    homeworkForm.reset();
    homeworkDialog.showModal();
    document.getElementById("homeworkTitle").focus();
});

document.getElementById("cancelHomeworkButton").addEventListener("click", function() {
    homeworkDialog.close();
});

homeworkForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var formData = new FormData(homeworkForm);
    var newHomework = {
        title: formData.get("title").trim(),
        subject: formData.get("subject"),
        date: formData.get("date"),
        priority: formData.get("priority"),
        notes: formData.get("notes").trim(),
        completed: false
    };

    if (!newHomework.title || !newHomework.subject || !newHomework.date || !newHomework.priority) {
        homeworkForm.reportValidity();
        return;
    }

    homework.push(newHomework);
    saveHomeworkData();
    updateHomeworkStats();
    displayUpcomingHomework();

    var dateParts = newHomework.date.split("-");
    currentYear = Number(dateParts[0]);
    currentMonth = Number(dateParts[1]) - 1;
    selectedCalendarDate = newHomework.date;
    createCalender();
    showHomeworkForDate(newHomework.date);
    homeworkDialog.close();
});

function changeCalendarMonth(offset) {
    var newMonth = new Date(currentYear, currentMonth + offset, 1);
    currentYear = newMonth.getFullYear();
    currentMonth = newMonth.getMonth();
    createCalender();

    document.getElementById("selectedDate").innerText = "Select a date";
    document.getElementById("selectedTasks").innerHTML =
        "<p>Click a date to see homework.</p>";
}

document.getElementById("previousMonth").addEventListener("click", function() {
    changeCalendarMonth(-1);
});

document.getElementById("nextMonth").addEventListener("click", function() {
    changeCalendarMonth(1);
});

document.getElementById("todayButton").addEventListener("click", function() {
    var today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    selectedCalendarDate = getTodayDateString();
    createCalender();
    showHomeworkForDate(selectedCalendarDate);
});



displayUpcomingHomework();
createCalender();
updateHeroProgress();
updateHomeworkStats();
