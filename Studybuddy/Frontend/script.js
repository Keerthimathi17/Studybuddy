/* script.js */

const API_BASE_URL = "http://localhost:8080";

const DEFAULT_SUBJECTS = [
    {name:"Java",category:"Programming"},
    {name:"Python",category:"Programming"},
    {name:"DBMS",category:"Computer Science"},
    {name:"Data Structures",category:"Computer Science"},
    {name:"Circuit Theory",category:"EEE"},
    {name:"Digital Electronics",category:"Electronics"}
];

const state = {

    currentUser:
        JSON.parse(localStorage.getItem("studyBuddyUser") || "null"),

    users:
        JSON.parse(localStorage.getItem("studyBuddyUsers") || "[]"),

    students:[],

    groups:
        JSON.parse(localStorage.getItem("studyBuddyGroups") || "[]"),

    sessions:
        JSON.parse(localStorage.getItem("studyBuddySessions") || "[]"),

    notifications:
        JSON.parse(localStorage.getItem("studyBuddyNotifications") || "[]"),

    subjects:
        JSON.parse(localStorage.getItem("studyBuddySubjects") || "[]"),

    connected:
        JSON.parse(localStorage.getItem("studyBuddyConnections") || "[]"),

    currentPage:"dashboard",

    calendarDate:new Date(),

    selectedDate:new Date()
};


/* =========================
   HELPERS
========================= */

const $ = id => document.getElementById(id);

function escapeHTML(value){

    if(value === null || value === undefined){
        return "";
    }

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


function initials(name){

    return String(name || "Student")
        .trim()
        .split(/\s+/)
        .slice(0,2)
        .map(x => x.charAt(0).toUpperCase())
        .join("");
}


function todayString(){

    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}


function formatDate(date){

    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}


function fullDate(date){

    return date.toLocaleDateString("en-US",{
        weekday:"long",
        month:"long",
        day:"numeric",
        year:"numeric"
    });
}


function monthYear(date){

    return date.toLocaleDateString("en-US",{
        month:"long",
        year:"numeric"
    });
}


function saveState(){

    localStorage.setItem(
        "studyBuddyUser",
        JSON.stringify(state.currentUser)
    );

    localStorage.setItem(
        "studyBuddyUsers",
        JSON.stringify(state.users)
    );

    localStorage.setItem(
        "studyBuddyGroups",
        JSON.stringify(state.groups)
    );

    localStorage.setItem(
        "studyBuddySessions",
        JSON.stringify(state.sessions)
    );

    localStorage.setItem(
        "studyBuddyNotifications",
        JSON.stringify(state.notifications)
    );

    localStorage.setItem(
        "studyBuddySubjects",
        JSON.stringify(state.subjects)
    );

    localStorage.setItem(
        "studyBuddyConnections",
        JSON.stringify(state.connected)
    );
}


function showToast(message,type="success"){

    const container = $("toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <i class="fa-solid ${
            type === "error"
                ? "fa-circle-xmark"
                : type === "info"
                    ? "fa-circle-info"
                    : "fa-circle-check"
        }"></i>

        <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(()=>{
        toast.style.opacity="0";
        toast.style.transform="translateY(10px)";

        setTimeout(()=>{
            toast.remove();
        },250);

    },2500);
}


/* =========================
   API
========================= */

async function apiRequest(endpoint,options={}){

    const response = await fetch(
        API_BASE_URL + endpoint,
        {
            ...options,
            headers:{
                "Content-Type":"application/json",
                ...(options.headers || {})
            }
        }
    );

    if(!response.ok){

        throw new Error(
            `HTTP ${response.status}`
        );
    }

    const type =
        response.headers.get("content-type") || "";

    if(type.includes("application/json")){
        return response.json();
    }

    return response.text();
}


/* =========================
   PAGE CONTROL
========================= */

function showPage(pageId){

    document.querySelectorAll(".page").forEach(page=>{
        page.classList.remove("active");
        page.style.display="none";
    });

    const page = $(pageId);

    if(!page){
        return;
    }

    page.classList.add("active");

    page.style.display =
        pageId === "authPage"
            ? "grid"
            : pageId === "appPage"
                ? "flex"
                : "block";
}


function showAuth(mode){

    showPage("authPage");

    $("loginForm").classList.toggle(
        "hidden",
        mode !== "login"
    );

    $("registerForm").classList.toggle(
        "hidden",
        mode !== "register"
    );

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


function togglePassword(id,button){

    const input = $(id);

    if(!input){
        return;
    }

    input.type =
        input.type === "password"
            ? "text"
            : "password";

    button.innerHTML = `
        <i class="fa-solid ${
            input.type === "password"
                ? "fa-eye"
                : "fa-eye-slash"
        }"></i>
    `;
}


/* =========================
   AUTH
========================= */

function loginUser(event){

    event.preventDefault();

    const email =
        $("loginEmail").value.trim().toLowerCase();

    const password =
        $("loginPassword").value;

    if(!email || !password){

        showToast(
            "Enter your email and password.",
            "error"
        );

        return;
    }

    const users =
        JSON.parse(
            localStorage.getItem("studyBuddyUsers") || "[]"
        );

    const user =
        users.find(
            item =>
                String(item.email).toLowerCase() === email
        );

    if(user){

        if(
            user.password &&
            user.password !== password
        ){

            showToast(
                "Incorrect password.",
                "error"
            );

            return;
        }

        state.currentUser = user;

    }else{

        /*
         Demo-friendly login.
         This allows a new email to enter the app.
        */

        const newUser = {
            id:Date.now(),
            name:email
                .split("@")[0]
                .replace(/[._-]/g," "),
            email,
            password
        };

        users.push(newUser);

        state.users = users;

        state.currentUser = newUser;
    }

    state.users = users;

    saveState();

    showApp();

    showToast(
        `Welcome back, ${state.currentUser.name}!`
    );
}


async function registerUser(event){

    event.preventDefault();

    const name =
        $("registerName").value.trim();

    const email =
        $("registerEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        $("registerPassword").value;

    if(
        !name ||
        !email ||
        !password
    ){

        showToast(
            "Please fill all fields.",
            "error"
        );

        return;
    }

    if(password.length < 6){

        showToast(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }

    const users =
        JSON.parse(
            localStorage.getItem("studyBuddyUsers") || "[]"
        );

    if(
        users.some(
            user =>
                String(user.email).toLowerCase() === email
        )
    ){

        showToast(
            "This email already has an account.",
            "error"
        );

        showAuth("login");

        return;
    }


    const newUser = {
        id:Date.now(),
        name,
        email,
        password
    };

    users.push(newUser);

    state.users = users;

    state.currentUser = newUser;

    saveState();


    /*
      Store the student in Spring Boot.
      Existing backend uses /api/students.
    */

    try{

        await apiRequest(
            "/api/students",
            {
                method:"POST",
                body:JSON.stringify({
                    name,
                    email
                })
            }
        );

    }catch(error){

        console.warn(
            "Backend student registration unavailable.",
            error
        );
    }


    showApp();

    showToast(
        "Account created successfully!"
    );
}


function logoutUser(){

    state.currentUser = null;

    localStorage.removeItem("studyBuddyUser");

    showPage("landingPage");

    showToast(
        "You have been logged out.",
        "info"
    );
}


/* =========================
   APP
========================= */

function showApp(){

    showPage("appPage");

    updateProfile();

    loadStudents();

    loadGroups();

    renderDashboard();

    renderSubjects();

    renderSessions();

    renderNotifications();

    renderProgress();

    updateCounts();

    navigateApp("dashboard");
}


/* =========================
   PROFILE
========================= */

function updateProfile(){

    if(!state.currentUser){
        return;
    }

    const name =
        state.currentUser.name || "Student";

    const email =
        state.currentUser.email || "";

    const initial =
        initials(name);


    if($("sidebarName"))
        $("sidebarName").textContent=name;

    if($("sidebarEmail"))
        $("sidebarEmail").textContent=email;

    if($("topName"))
        $("topName").textContent=name;

    if($("welcomeName"))
        $("welcomeName").textContent=name;

    if($("profileName"))
        $("profileName").textContent=name;

    if($("profileEmail"))
        $("profileEmail").textContent=email;

    if($("profileDetailName"))
        $("profileDetailName").textContent=name;

    if($("profileDetailEmail"))
        $("profileDetailEmail").textContent=email;

    if($("sidebarAvatar"))
        $("sidebarAvatar").textContent=initial;

    if($("topAvatar"))
        $("topAvatar").textContent=initial;

    if($("profileAvatar"))
        $("profileAvatar").textContent=initial;
}


function editProfile(){

    if(!state.currentUser){
        return;
    }

    const name =
        prompt(
            "Enter your full name:",
            state.currentUser.name
        );

    if(name === null){
        return;
    }

    const email =
        prompt(
            "Enter your email:",
            state.currentUser.email
        );

    if(email === null){
        return;
    }

    if(!name.trim() || !email.trim()){

        showToast(
            "Name and email cannot be empty.",
            "error"
        );

        return;
    }

    const oldEmail =
        state.currentUser.email;

    state.currentUser.name =
        name.trim();

    state.currentUser.email =
        email.trim().toLowerCase();


    const index =
        state.users.findIndex(
            user =>
                String(user.email).toLowerCase() ===
                String(oldEmail).toLowerCase()
        );

    if(index !== -1){

        state.users[index] =
            state.currentUser;
    }


    saveState();

    updateProfile();

    showToast(
        "Profile updated successfully!"
    );
}


/* =========================
   NAVIGATION
========================= */

function navigateApp(page){

    const pages = [
        "dashboard",
        "students",
        "groups",
        "subjects",
        "sessions",
        "progress",
        "notifications",
        "profile"
    ];

    pages.forEach(name=>{

        const element =
            $(`${name}Page`);

        if(element){
            element.classList.add("hidden");
        }
    });


    const target =
        $(`${page}Page`);

    if(target){
        target.classList.remove("hidden");
    }


    document.querySelectorAll(".sidebar-link")
        .forEach(link=>{

            link.classList.toggle(
                "active",
                link.dataset.page === page
            );

        });


    state.currentPage = page;

    if(page === "dashboard")
        renderDashboard();

    if(page === "students")
        renderStudents();

    if(page === "groups")
        renderGroups();

    if(page === "subjects")
        renderSubjects();

    if(page === "sessions")
        renderSessions();

    if(page === "progress")
        renderProgress();

    if(page === "notifications")
        renderNotifications();

    if(page === "profile")
        updateProfile();


    toggleSidebar(false);

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


/* =========================
   SIDEBAR
========================= */

function toggleSidebar(force){

    const sidebar =
        $("sidebar");

    if(!sidebar){
        return;
    }

    if(force === false){

        sidebar.classList.remove(
            "mobile-open"
        );

        return;
    }

    sidebar.classList.toggle(
        "mobile-open"
    );
}


/* =========================
   STUDENTS
========================= */

async function loadStudents(){

    try{

        const students =
            await apiRequest(
                "/api/students"
            );

        if(Array.isArray(students)){

            state.students =
                students;

            students.forEach(student=>{

                if(!student.email){
                    return;
                }

                const exists =
                    state.users.some(
                        user =>
                            String(user.email).toLowerCase() ===
                            String(student.email).toLowerCase()
                    );

                if(!exists){

                    state.users.push({
                        id:student.id,
                        name:student.name,
                        email:student.email
                    });
                }

            });

            saveState();

        }

    }catch(error){

        console.warn(
            "Unable to load students from backend.",
            error
        );

        state.students =
            state.users;
    }

    renderStudents();
    renderDashboard();
    updateCounts();
}


function getAllStudents(){

    const backend =
        Array.isArray(state.students)
            ? state.students
            : [];

    const local =
        Array.isArray(state.users)
            ? state.users
            : [];

    const merged = [
        ...backend,
        ...local
    ];

    const unique = [];

    const emails = new Set();

    merged.forEach(student=>{

        const email =
            String(student.email || "").toLowerCase();

        if(
            !email ||
            emails.has(email)
        ){
            return;
        }

        emails.add(email);

        unique.push(student);

    });

    return unique;
}


function renderStudents(){

    const container =
        $("allStudents");

    if(!container){
        return;
    }

    const search =
        ($("studentSearch")?.value || "")
            .trim()
            .toLowerCase();

    const subject =
        $("studentSubjectFilter")?.value || "all";


    let students =
        getAllStudents()
            .filter(student=>{

                if(
                    state.currentUser &&
                    String(student.email).toLowerCase() ===
                    String(state.currentUser.email).toLowerCase()
                ){
                    return false;
                }

                const name =
                    String(student.name || "").toLowerCase();

                const email =
                    String(student.email || "").toLowerCase();

                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search);

                return matchesSearch;
            });


    if(!students.length){

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-user-group"></i>
                </div>

                <h3>No study buddies yet</h3>

                <p>
                    Create another account to discover
                    another student.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        students.map(student=>{

            const id =
                student.id || student.email;

            const connected =
                state.connected.includes(
                    String(id)
                );


            return `
                <article class="student-card">

                    <div class="student-top">

                        <div class="student-avatar">
                            ${escapeHTML(
                                initials(student.name)
                            )}
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(
                                    student.name || "Student"
                                )}
                            </strong>

                            <small>
                                Student
                            </small>
                        </div>

                    </div>


                    <div class="student-email">
                        <i class="fa-regular fa-envelope"></i>
                        ${escapeHTML(student.email)}
                    </div>


                    <div class="student-subjects">

                        <span class="subject-tag">
                            Java
                        </span>

                        <span class="subject-tag">
                            DBMS
                        </span>

                    </div>


                    <button
                        class="connect-btn ${
                            connected
                                ? "connected"
                                : ""
                        }"
                        onclick="connectBuddy('${String(id).replace(/'/g,"")}')">

                        ${
                            connected
                                ? '<i class="fa-solid fa-check"></i> Connected'
                                : '<i class="fa-solid fa-user-plus"></i> Connect'
                        }

                    </button>

                </article>
            `;

        }).join("");
}


function connectBuddy(id){

    const key =
        String(id);

    if(state.connected.includes(key)){

        state.connected =
            state.connected.filter(
                item => item !== key
            );

        showToast(
            "Connection removed.",
            "info"
        );

    }else{

        state.connected.push(key);

        state.notifications.unshift({
            id:Date.now(),
            message:"You connected with a new StudyBuddy.",
            time:new Date().toLocaleString(),
            read:false
        });

        showToast(
            "StudyBuddy connection added!"
        );
    }

    saveState();

    renderStudents();
    renderDashboard();
    renderNotifications();
    updateCounts();
}


/* =========================
   DASHBOARD
========================= */

function renderDashboard(){

    updateProfile();

    const students =
        getAllStudents().filter(student=>{

            if(!state.currentUser){
                return true;
            }

            return String(student.email).toLowerCase() !==
                String(state.currentUser.email).toLowerCase();

        });


    if($("dashboardBuddyCount"))
        $("dashboardBuddyCount").textContent =
            students.length;


    if($("dashboardGroupCount"))
        $("dashboardGroupCount").textContent =
            state.groups.length;


    if($("dashboardHours"))
        $("dashboardHours").textContent =
            `${Math.max(state.sessions.length * 1.5,0)}h`;


    if($("todayLabel"))
        $("todayLabel").textContent =
            fullDate(new Date()).toUpperCase();


    renderRecommended();

    renderDashboardSessions();

    renderDashboardGroups();
}


function renderRecommended(){

    const container =
        $("recommendedStudents");

    if(!container){
        return;
    }

    const students =
        getAllStudents()
            .filter(student=>{

                if(!state.currentUser){
                    return true;
                }

                return String(student.email).toLowerCase() !==
                    String(state.currentUser.email).toLowerCase();

            })
            .slice(0,4);


    if(!students.length){

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-user-plus"></i>
                </div>

                <h3>No buddies yet</h3>

                <p>
                    Register another student account
                    to see recommendations.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        students.map(student=>{

            const id =
                String(student.id || student.email);

            const connected =
                state.connected.includes(id);

            return `
                <div class="buddy-item">

                    <div class="buddy-avatar">
                        ${escapeHTML(
                            initials(student.name)
                        )}
                    </div>

                    <div class="buddy-info">

                        <strong>
                            ${escapeHTML(student.name)}
                        </strong>

                        <small>
                            ${escapeHTML(student.email)}
                        </small>

                    </div>

                    <button
                        class="connect-btn ${
                            connected
                                ? "connected"
                                : ""
                        }"
                        onclick="connectBuddy('${id.replace(/'/g,"")}')">

                        ${
                            connected
                                ? "Connected"
                                : "Connect"
                        }

                    </button>

                </div>
            `;

        }).join("");
}


function renderDashboardSessions(){

    const container =
        $("dashboardSessions");

    if(!container){
        return;
    }

    const sessions =
        [...state.sessions]
            .sort(
                (a,b)=>
                    `${a.date} ${a.time}`
                        .localeCompare(
                            `${b.date} ${b.time}`
                        )
            )
            .slice(0,3);


    if(!sessions.length){

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-calendar"></i>
                </div>

                <h3>No sessions yet</h3>

                <p>
                    Plan your first study session.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        sessions.map(session=>`

            <div class="mini-session">

                <div class="mini-session-time">
                    ${escapeHTML(session.time)}
                </div>

                <div>
                    <strong>
                        ${escapeHTML(session.title)}
                    </strong>

                    <small>
                        ${escapeHTML(session.subject)}
                        • ${escapeHTML(session.date)}
                    </small>
                </div>

            </div>

        `).join("");
}


function renderDashboardGroups(){

    const container =
        $("dashboardGroups");

    if(!container){
        return;
    }

    if(!state.groups.length){

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-people-group"></i>
                </div>

                <h3>No groups yet</h3>

                <p>
                    Create your first study group.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        state.groups
            .slice(0,3)
            .map(group=>`

                <div class="group-mini">

                    <div class="group-mini-icon">
                        <i class="fa-solid fa-people-group"></i>
                    </div>

                    <h3>
                        ${escapeHTML(group.name)}
                    </h3>

                    <p>
                        ${escapeHTML(group.subject)}
                        • ${group.members || 1}/${group.maxMembers || 5}
                        members
                    </p>

                </div>

            `).join("");
}


/* =========================
   GROUPS
========================= */

async function loadGroups(){

    try{

        const groups =
            await apiRequest(
                "/api/groups"
            );

        if(Array.isArray(groups)){

            state.groups =
                groups.map(group=>({

                    ...group,

                    members:
                        group.members || 1

                }));

            saveState();
        }

    }catch(error){

        console.warn(
            "Unable to load groups from backend.",
            error
        );
    }

    renderGroups();
    renderDashboard();
    updateCounts();
}


function renderGroups(){

    const container =
        $("allGroups");

    if(!container){
        return;
    }

    const search =
        ($("groupSearch")?.value || "")
            .trim()
            .toLowerCase();

    const subject =
        $("groupSubjectFilter")?.value || "all";


    let groups =
        state.groups.filter(group=>{

            const text =
                `${group.name || ""} ${group.subject || ""} ${group.description || ""}`
                    .toLowerCase();

            const searchMatch =
                !search ||
                text.includes(search);

            const subjectMatch =
                subject === "all" ||
                String(group.subject).toLowerCase() ===
                    subject.toLowerCase();

            return searchMatch && subjectMatch;
        });


    if(!groups.length){

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-people-group"></i>
                </div>

                <h3>No study groups found</h3>

                <p>
                    Create a group and start learning together.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        groups.map(group=>`

            <article class="group-card">

                <div class="group-icon">
                    <i class="fa-solid fa-people-group"></i>
                </div>

                <h3>
                    ${escapeHTML(group.name)}
                </h3>

                <span class="group-subject">
                    ${escapeHTML(group.subject || "General")}
                </span>

                <p>
                    ${escapeHTML(
                        group.description ||
                        "Collaborate, discuss and learn together."
                    )}
                </p>

                <div class="group-footer">

                    <span class="group-members">
                        <i class="fa-solid fa-users"></i>
                        ${group.members || 1}
                        /
                        ${group.maxMembers || 5}
                        members
                    </span>

                    <button
                        class="connect-btn"
                        onclick="joinGroup(${Number(group.id)})">

                        Join Group

                    </button>

                </div>

            </article>

        `).join("");
}


function openGroupModal(){

    $("groupModal")
        .classList
        .add("show");
}


async function createGroup(event){

    event.preventDefault();

    const name =
        $("groupName").value.trim();

    const subject =
        $("groupSubject").value.trim();

    const description =
        $("groupDescription").value.trim();

    const maxMembers =
        Number($("groupMaxMembers").value);


    if(!name || !subject || !maxMembers){

        showToast(
            "Please fill all required fields.",
            "error"
        );

        return;
    }


    const data = {

        name,

        subject,

        description,

        maxMembers,

        creatorId:
            state.currentUser?.id || 1

    };


    let backendGroup = null;


    try{

        backendGroup =
            await apiRequest(
                "/api/groups",
                {
                    method:"POST",
                    body:JSON.stringify(data)
                }
            );

    }catch(error){

        console.warn(
            "Backend group creation failed.",
            error
        );
    }


    const group = {

        id:
            backendGroup?.id ||
            Date.now(),

        name,

        subject,

        description,

        maxMembers,

        creatorId:
            state.currentUser?.id || 1,

        members:1

    };


    state.groups.push(group);

    saveState();

    closeModal("groupModal");

    event.target.reset();

    renderGroups();

    renderDashboard();

    updateCounts();

    showToast(
        "Study group created successfully!"
    );
}


function joinGroup(id){

    const group =
        state.groups.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if(!group){
        return;
    }

    const current =
        Number(group.members || 1);

    const maximum =
        Number(group.maxMembers || 5);

    if(current >= maximum){

        showToast(
            "This group is already full.",
            "error"
        );

        return;
    }


    group.members =
        current + 1;


    state.notifications.unshift({

        id:Date.now(),

        message:
            `You joined "${group.name}".`,

        time:new Date().toLocaleString(),

        read:false

    });


    saveState();

    renderGroups();

    renderDashboard();

    renderNotifications();

    showToast(
        `Joined ${group.name}!`
    );
}


/* =========================
   SUBJECTS
========================= */

function getSubjects(){

    const saved =
        state.subjects.length
            ? state.subjects
            : DEFAULT_SUBJECTS;

    return saved;
}


function renderSubjects(){

    const container =
        $("subjectGrid");

    if(!container){
        return;
    }


    const subjects =
        getSubjects();


    container.innerHTML =
        subjects.map((subject,index)=>`

            <article class="subject-card">

                <i class="fa-solid ${
                    index % 3 === 0
                        ? "fa-code"
                        : index % 3 === 1
                            ? "fa-database"
                            : "fa-bolt"
                }"></i>

                <h3>
                    ${escapeHTML(subject.name)}
                </h3>

                <p>
                    ${escapeHTML(subject.category)}
                </p>

                <button
                    onclick="navigateApp('students')">

                    Find Buddies

                </button>

            </article>

        `).join("");
}


function openSubjectModal(){

    $("subjectModal")
        .classList
        .add("show");
}


function createSubject(event){

    event.preventDefault();

    const name =
        $("newSubjectName").value.trim();

    const category =
        $("newSubjectCategory").value;


    if(!name){

        showToast(
            "Enter a subject name.",
            "error"
        );

        return;
    }


    const exists =
        getSubjects().some(
            subject =>
                subject.name.toLowerCase() ===
                name.toLowerCase()
        );

    if(exists){

        showToast(
            "This subject already exists.",
            "error"
        );

        return;
    }


    state.subjects.push({
        name,
        category
    });

    saveState();

    closeModal("subjectModal");

    event.target.reset();

    renderSubjects();

    showToast(
        `${name} added successfully!`
    );
}


/* =========================
   CALENDAR
========================= */

function renderSessions(){

    renderCalendar();

    renderSchedule();
}


function changeMonth(offset){

    state.calendarDate =
        new Date(
            state.calendarDate.getFullYear(),
            state.calendarDate.getMonth() + offset,
            1
        );

    renderCalendar();
}


function renderCalendar(){

    const grid =
        $("calendarGrid");

    if(!grid){
        return;
    }


    const date =
        state.calendarDate;

    $("calendarMonth").textContent =
        monthYear(date);


    grid.innerHTML="";


    const year =
        date.getFullYear();

    const month =
        date.getMonth();


    let first =
        new Date(year,month,1).getDay();

    first =
        first === 0 ? 6 : first - 1;


    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    for(let i=first-1;i>=0;i--){

        createCalendarDay(
            grid,
            previousDays-i,
            new Date(
                year,
                month-1,
                previousDays-i
            ),
            true
        );
    }


    for(let day=1;day<=days;day++){

        createCalendarDay(
            grid,
            day,
            new Date(year,month,day),
            false
        );
    }


    const remaining =
        42 - grid.children.length;


    for(let day=1;day<=remaining;day++){

        createCalendarDay(
            grid,
            day,
            new Date(
                year,
                month+1,
                day
            ),
            true
        );
    }
}


function createCalendarDay(
    container,
    number,
    date,
    otherMonth
){

    const button =
        document.createElement("button");

    button.type="button";

    button.className="calendar-day";

    if(otherMonth)
        button.classList.add("other");


    if(formatDate(date) === todayString())
        button.classList.add("today");


    if(
        formatDate(date) ===
        formatDate(state.selectedDate)
    ){
        button.classList.add("selected");
    }


    const hasSession =
        state.sessions.some(
            session =>
                session.date ===
                formatDate(date)
        );


    if(hasSession)
        button.classList.add("has-session");


    button.textContent =
        number;


    button.onclick = ()=>{

        state.selectedDate =
            date;

        if(otherMonth){

            state.calendarDate =
                new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1
                );
        }

        renderCalendar();

        renderSchedule();
    };


    container.appendChild(button);
}


function renderSchedule(){

    const container =
        $("scheduleList");

    if(!container){
        return;
    }


    $("selectedDate").textContent =
        fullDate(state.selectedDate);


    const date =
        formatDate(state.selectedDate);


    const sessions =
        state.sessions.filter(
            session =>
                session.date === date
        );


    if(!sessions.length){

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-calendar-plus"></i>
                </div>

                <h3>No study sessions</h3>

                <p>
                    Nothing planned for this day.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="openSessionModal()">

                    + Create Session

                </button>

            </div>
        `;

        return;
    }


    container.innerHTML =
        sessions.map(session=>`

            <div class="session-card">

                <div class="session-time">
                    ${escapeHTML(session.time)}
                </div>

                <div class="session-info">

                    <strong>
                        ${escapeHTML(session.title)}
                    </strong>

                    <small>
                        ${escapeHTML(session.subject)}
                    </small>

                    ${
                        session.description
                            ? `
                                <small>
                                    ${escapeHTML(
                                        session.description
                                    )}
                                </small>
                            `
                            : ""
                    }

                </div>

                <button
                    class="delete-session"
                    onclick="deleteSession(${Number(session.id)})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        `).join("");
}


function openSessionModal(){

    const dateInput =
        $("sessionDate");

    if(dateInput){

        dateInput.value =
            formatDate(
                state.selectedDate
            );
    }


    $("sessionModal")
        .classList
        .add("show");
}


function createSession(event){

    event.preventDefault();

    const session = {

        id:Date.now(),

        title:
            $("sessionTitle").value.trim(),

        subject:
            $("sessionSubject").value.trim(),

        date:
            $("sessionDate").value,

        time:
            $("sessionTime").value,

        description:
            $("sessionDescription").value.trim()

    };


    if(
        !session.title ||
        !session.subject ||
        !session.date ||
        !session.time
    ){

        showToast(
            "Please complete all required fields.",
            "error"
        );

        return;
    }


    state.sessions.push(session);

    state.notifications.unshift({

        id:Date.now()+1,

        message:
            `Study session "${session.title}" scheduled.`,

        time:new Date().toLocaleString(),

        read:false

    });


    state.selectedDate =
        new Date(
            `${session.date}T00:00:00`
        );


    state.calendarDate =
        new Date(
            state.selectedDate.getFullYear(),
            state.selectedDate.getMonth(),
            1
        );


    saveState();

    closeModal("sessionModal");

    event.target.reset();

    renderSessions();

    renderDashboard();

    renderNotifications();

    renderProgress();

    updateCounts();

    showToast(
        "Study session scheduled!"
    );
}


function deleteSession(id){

    state.sessions =
        state.sessions.filter(
            session =>
                Number(session.id) !==
                Number(id)
        );

    saveState();

    renderSessions();

    renderDashboard();

    renderProgress();

    updateCounts();

    showToast(
        "Study session deleted.",
        "info"
    );
}


/* =========================
   PROGRESS
========================= */

function renderProgress(){

    const sessions =
        state.sessions.length;

    const groups =
        state.groups.length;

    const buddies =
        state.connected.length;


    if($("progressSessions"))
        $("progressSessions").textContent=sessions;

    if($("progressGroups"))
        $("progressGroups").textContent=groups;

    if($("progressBuddies"))
        $("progressBuddies").textContent=buddies;


    const progress =
        Math.min(
            100,
            sessions / 5 * 100
        );


    if($("goalProgressBar"))
        $("goalProgressBar").style.width =
            `${progress}%`;


    if($("goalText"))
        $("goalText").textContent =
            `${Math.min(sessions,5)} / 5 sessions`;


    const chart =
        $("activityChart");

    if(!chart){
        return;
    }


    const values = [
        25,
        42,
        35,
        65,
        50,
        75,
        Math.max(30,sessions*15)
    ];


    chart.innerHTML =
        values.map(
            (value,index)=>`

                <div
                    class="chart-bar"
                    style="--height:${value}%">

                    <span>
                        ${
                            ["M","T","W","T","F","S","S"][index]
                        }
                    </span>

                </div>
            `
        ).join("");
}


/* =========================
   NOTIFICATIONS
========================= */

function renderNotifications(){

    const container =
        $("notificationsList");

    if(!container){
        return;
    }


    if(!state.notifications.length){

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-regular fa-bell"></i>
                </div>

                <h3>No notifications</h3>

                <p>
                    You're all caught up!
                </p>

            </div>
        `;

        updateNotificationBadge();

        return;
    }


    container.innerHTML =
        state.notifications
            .slice(0,30)
            .map(notification=>`

                <div class="notification-item ${
                    notification.read
                        ? ""
                        : "unread"
                }">

                    <div class="notification-icon">
                        <i class="fa-solid fa-bell"></i>
                    </div>

                    <div>

                        <p>
                            <strong>
                                StudyBuddy
                            </strong>

                            ${escapeHTML(
                                notification.message
                            )}
                        </p>

                        <small>
                            ${escapeHTML(
                                notification.time || ""
                            )}
                        </small>

                    </div>

                </div>

            `).join("");


    updateNotificationBadge();
}


function markNotificationsRead(){

    state.notifications =
        state.notifications.map(
            notification=>({
                ...notification,
                read:true
            })
        );

    saveState();

    renderNotifications();

    showToast(
        "Notifications marked as read."
    );
}


function updateNotificationBadge(){

    const unread =
        state.notifications.filter(
            notification =>
                !notification.read
        ).length;


    if($("notificationBadge"))
        $("notificationBadge").textContent =
            unread;


    if($("notificationDot"))
        $("notificationDot").style.display =
            unread ? "block" : "none";
}


/* =========================
   COUNTS
========================= */

function updateCounts(){

    const students =
        getAllStudents().filter(student=>{

            if(!state.currentUser){
                return true;
            }

            return String(student.email).toLowerCase() !==
                String(state.currentUser.email).toLowerCase();

        }).length;


    if($("studentCountBadge"))
        $("studentCountBadge").textContent =
            students;


    if($("profileGroupCount"))
        $("profileGroupCount").textContent =
            state.groups.length;


    if($("profileBuddyCount"))
        $("profileBuddyCount").textContent =
            state.connected.length;


    updateNotificationBadge();
}


/* =========================
   GLOBAL SEARCH
========================= */

function globalSearch(){

    const query =
        ($("globalSearch")?.value || "")
            .trim()
            .toLowerCase();


    if(!query){
        return;
    }


    if(
        query.includes("group")
    ){

        navigateApp("groups");

        if($("groupSearch"))
            $("groupSearch").value =
                query
                    .replace("group","")
                    .trim();

        renderGroups();

        return;
    }


    if(
        query.includes("subject")
    ){

        navigateApp("subjects");

        return;
    }


    navigateApp("students");

    if($("studentSearch"))
        $("studentSearch").value=query;

    renderStudents();
}


/* =========================
   MODALS
========================= */

function closeModal(id){

    const modal =
        $(id);

    if(modal)
        modal.classList.remove("show");
}


function closeModalOutside(event,id){

    if(event.target.id === id){
        closeModal(id);
    }
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event=>{

        if(
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ){

            event.preventDefault();

            $("globalSearch")?.focus();
        }


        if(event.key === "Escape"){

            document
                .querySelectorAll(".modal-overlay.show")
                .forEach(modal=>{
                    modal.classList.remove("show");
                });
        }

    }
);


/* =========================
   START APPLICATION
========================= */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        /*
          Default subjects exist even before
          the user adds a custom subject.
        */

        if(!state.subjects.length){

            state.subjects =
                DEFAULT_SUBJECTS.map(
                    subject=>({...subject})
                );

            saveState();
        }


        /*
          If a user was already logged in,
          directly open the application.
        */

        if(state.currentUser){

            showApp();

        }else{

            showPage("landingPage");

        }


        /*
          Close sidebar by clicking outside
          on mobile.
        */

        document.addEventListener(
            "click",
            event=>{

                const sidebar =
                    $("sidebar");

                const menu =
                    document.querySelector(".mobile-menu");

                if(
                    sidebar &&
                    sidebar.classList.contains("mobile-open") &&
                    !sidebar.contains(event.target) &&
                    !menu?.contains(event.target)
                ){

                    sidebar.classList.remove(
                        "mobile-open"
                    );
                }

            }
        );

    }
);