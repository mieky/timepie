class Student {
    fullname : string;
    constructor(public firstname, public middleinitial, public lastname) {
        this.fullname = firstname + " " + middleinitial + " " + lastname;
    }
}

interface Person {
    firstname: string;
    lastname: string;
}

function greeter(person : Person) {
    console.error("testing");
    return "This is all fine and stuff, ain't that right, " + person.firstname + "+?!?";
}

var user = new Student("Jane", "M.", "User");

document.body.innerHTML = greeter(user);
