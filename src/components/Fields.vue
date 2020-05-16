<template>
  <div class="fields">
    <!-- {{$store.state.dataset}} -->
    <h1 class="title">{{ header }}</h1>
    <input
      v-model="numberOfFields"
      type="range"
      min="1"
      max="26"
      step="1"
    />
    <p>Slide for number of fields</p>
    <p>{{ numberOfFields }}</p>
    <div class="outer_border" v-for="(obj, i) in fields" :key="i">
      <div class="inner_border">{{ obj.mark }}</div>
      <div class="inner_border">{{ obj.value }}</div>
      <div class="inner_border">{{ obj.sign }}</div>
      <div class="inner_border" v-html="obj.pointer"></div>
      <div class="interval">
        <input type="checkbox" name="interval" v-model="obj.checked" />
        <label for="interval">Randomize</label>
      </div>
    </div>
    <p v-html="possible_combinations" class="comb"></p>
    <input
      v-model="numbers"
      type="range"
      min="2"
      max="19"
      step="1"
    />
    <p>{{ numbers }}</p>
    <!-- max value set to 19 as it hits infinit combs when 10 fields are set -->
    <p>Slide for additional possible values</p>
    <span class="comb">
      Note: You can even add more signs through code,
      <br>
      at line 55 of Fields component
    </span>
  </div>
</template>

<script>
/*eslint-disable*/
import { bus } from "../main";
import store from "../store";

// preventing local storage to load on refresh | setting to zero
let rand_key = 0;

export default {
  data() {
    return {
      numbers: 2, // you can add more values here or through browser
      signs: ["+", "-"], // you can add more signs here
      numberOfFields: 10, // initial value | set by task
      markArray: [],
      fields: {
        /**
         * structure of object | reminder
         * a: {
         *  mark: 'A',
         *  value: 3,
         *  sign: null,
         *  pointer: null,
         *  values: []
         * }
         * b: ...
         */
      },
      intId: 0 // Interval ID | to enable STOP Interval from Home component
    };
  },
  created() {
    this.set_object_from_local_storage();

    // enabling continuty for timer | never returns to zero
    let timer = parseInt(localStorage.getItem('timer'))
    if(!timer)
      timer = 0;

    // preventing local storage to load on refresh | setting 6 random chars
    rand_key = Math.random()
      .toString(36)
      .substring(2, 8);
    
    this.mainLogic(timer)
  },
  watch: {
    numberOfFields() { // if numberOfFields in data() change restart building fields object
      if(isNaN(this.numberOfFields)) { // only numbers allowed
        alert('Nije broj!')
        this.numberOfFields = 10
      }
      this.markArrayLogic();
      this.setObject();

      // preventing reset of object values array
      let ls_fields = JSON.parse(localStorage.getItem("fields"));

      // logic for slider going from higher to lower values
      if (this.numberOfFields < ls_fields.numberOfFields) {
        for (const obj in ls_fields.fields) { // loop thtough ls object
          if (!this.markArray.includes(obj)) {
            delete ls_fields.fields[obj]; // delete every obj property that is not in markArray array
          }
        }
        this.fields = ls_fields.fields; // finally set previous values from ls object to data object 

      } else {

        // logic for slider going from lower to higher values
        for (const obj in ls_fields.fields) { // loop through ls object
          if (this.markArray.includes(obj)) {
            this.fields[obj] = ls_fields.fields[obj]; // assign previous values sequentially
          }
        }
      }
    },
    /* 
    * numbers watcher does not contain same logic as numberOfFields
    * meaning it will reset to inital value of 2 after routing from STATISTIC to HOME
    */
    numbers() { // only numbers allowed
      if(isNaN(this.numbers)) {
        alert('Nije broj!')
        this.numbers = 2
      }
    }
  },
  computed: {

    // simple logic for computing possible combinations depending on number of values and signs
    possible_combinations() {
      let no_signs =
        (this.factorial(this.signs.length) / this.factorial(1)) *
        this.factorial(this.signs.length - 1); // n! / r! * (n - r)! | known formula to calculate possible combinations
      let no_numbers =
        (this.factorial(this.numbers) / this.factorial(1)) *
        this.factorial(this.numbers - 1); // n! / r! * (n - r)!
      if (this.numberOfFields > 10) // showing difrently formated  number of combs (example: 5 to the power of 16)
        return `Possible combinations with ${this.signs.length} signs and ${
          this.numbers
        } numbers: ${no_signs * no_numbers} <sup>${this.numberOfFields}</sup>`; // sup must go as v-html
      return ( // else return standard number of combs
        `Possible combinations with ${this.signs.length} signs and ${this.numbers} numbers: ` +
        Math.pow(no_signs * no_numbers, this.numberOfFields)
      );
    }
  },
  methods: {
    mainLogic(timer) { // timer sent as param as it is instanciated in created() hook

      // starting Interval after 2 seconds
      this.intId = setInterval(() => {
        store.state.dataset = []; // empty previos dataset array

        timer += 2;
        localStorage.setItem('timer', timer)
        store.state.labels.push(timer); // storing labels for charts

        console.log("[interval run check]");

        for (const prop in this.fields) {
          if (this.fields[prop].checked) { // consider only checked fields

            // assign a random value to each field
            let random_value = Math.ceil(Math.random() * this.numbers);
            this.fields[prop].value = random_value;
            this.fields[prop].values.push(random_value); // push each value to its object for later use in charts

            // randomize sign
            let rand = this.signs[
              Math.round(Math.random() * (this.signs.length - 1))
            ];
            this.fields[prop].sign = rand;
            rand == "+"
              ? (this.fields[prop].pointer = "&nearr;") // up arrow | HTML entity
              : (this.fields[prop].pointer = "&searr;") // down arrow | HTML entity

            // setting object state to local storage | set here in a loop to compensate for 2 second gap 
            localStorage.setItem(
              "fields",
              JSON.stringify({
                numberOfFields: this.numberOfFields,
                markArray: this.markArray,
                fields: this.fields,
                intId: this.intId,
                key: rand_key
              })
            );

            // formatting and storing data for charts
            store.state.dataset.push({
              label: this.fields[prop].mark,
              data: this.fields[prop].values
            });
          }
        }
        bus.$emit("intervalId", { // emitting Interval Id to enable Interval stop in Home component
          intId: this.intId
        });
      }, 2000)
    },
    markArrayLogic() { // for set numberOfFields makes an array of letters | used to give keys to created objects
      this.markArray = [];
      let i = 0;
      let char = "a";
      while (i < this.numberOfFields) {
        this.markArray.push(char);
        char = this.nextChar(char);
        i++;
      }
    },
    nextChar(c) {
      return String.fromCharCode(c.charCodeAt(0) + 1); // converting a Unicode number into a char and advancing (a, b, c...)
    },

    // setting default object
    setObject() {
      this.fields = {};
      this.markArray.map(prop => {
        this.fields[prop] = {
          mark: prop.toUpperCase(),
          value: 3,
          sign: "+",
          pointer: "&nearr;",
          checked: true,
          values: [] // used for storing random values to be displayed into charts
        };
      });

      // setting an object reference to itself to sustain reactivity
      this.fields = Object.assign({}, this.fields);
    },
    factorial(n) {
      return n != 1 ? n * this.factorial(n - 1) : 1; // using recursion to calculate factorial of a given number
    },
    set_object_from_local_storage() {
      let ls_fields = JSON.parse(localStorage.getItem("fields"));
      if (ls_fields) {
        if (ls_fields.key == rand_key) { // if equal, number of fields stays the same after switching between HOME to STATISTICS and back
          this.numberOfFields = ls_fields.numberOfFields;
          this.markArray = ls_fields.markArray;
          this.fields = ls_fields.fields;
        } else { // if not equal, number of fields will return to initial value as everything resets
          this.markArrayLogic();
          this.setObject();
        }
      } else { // if local storage empty reset everything
        this.markArrayLogic();
        this.setObject();
      }
    }
  },
  name: "Fields",
  props: {
    header: String
  }
};
</script>

<style scoped>
.outer_border {
  padding: 5px;
  margin-bottom: 10px !important;
  border-radius: 5px;
  border-bottom: 1px red solid;
  box-shadow: 0px 5px 10px -10px red;
  width: fit-content;
  margin: auto;
  display: flex;
  justify-content: space-evenly;
}
.comb {
  margin-top: 40px;
  font-size: 12px;
}
.inner_border {
  /* border-radius: 5px;
    border-bottom: 1px red solid; */
  width: 30px;
}
.interval {
  width: 125px;
}
.interval label {
  margin-left: 5px;
}
.title {
  font-size: 25px;
}
</style>
