let input = document.getElementsByClassName("input");
let year = document.getElementsByClassName("year");
let month = document.getElementsByClassName("month");
let day = document.getElementsByClassName("day");
let btn = document.getElementsByClassName("button");


function CalculateAge(){

let value = input[0].value;
  if(value === ""){
    alert("Please select Date of Birth");
    return;
  }
  let dob = new Date(value);
  let today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

//   adjust days
if(days < 0){
    months--;
    let preMonth = new Date(today.getFullYear(),today.getMonth(),0);
    days += preMonth.getDate();
}

//   adjust Month
if(months < 0){
    years--;
    months += 12;
}

year[0].innerHTML= years;
month[0].innerHTML = months;
day[0].innerHTML = days;



}
btn[0].addEventListener("click", (e) => {
    e.preventDefault();
    CalculateAge();
});



