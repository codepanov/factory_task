<template>
  <div class="chart">
    <!-- {{$store.state.dataset}} -->
    <canvas ref="dataChart"></canvas>
  </div>
</template>

<script>
/*eslint-disable*/
import { bus } from "../main";
import Charts from "vue-chartjs";
import store from "../store";

export default {
  data() {
    return {
      unformated_data: store.getters.dataset,
      formated_data: []
    };
  },
  mounted() {
    this.show_chart();
  },
  methods: {
    show_chart() {
      this.unformated_data.map(el => {
        this.formated_data.push({
          label: el.label,
          data: el.data,
          backgroundColor: 'rgba(185, 195, 206, 0.1)', // trying to override chartjs 'skip' error
          borderColor: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6),
          fill: false, // chartjs has an inside error handling datasets | will look into it
          borderWidth: 1
        });
      });
      let dataChart = this.$refs.dataChart.getContext("2d");
      new Chart(dataChart, {
        type: "line",
        data: {
          labels: store.getters.labels,
          datasets: this.formated_data
          // datasets: store.getters.dataset
        },
        options: {
          title: {
            display: true,
            text: "Ploted Data from Task",
            fontSize: 20
          },
          legend: {
            display: true,
            position: "right",
            labels: {
              fontColor: "#000"
            }
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  suggestedMin: 0,
                  suggestedMax: 3,
                  stepSize: 1,
                  fontColor: "#B9C3CE",
                  fontSize: 16
                }
              }
            ]
          },
          layout: {
            padding: {
              left: 50,
              right: 0,
              bottom: 0,
              top: 0
            }
          },
          tooltips: {
            enabled: true
          }
        }
      });
    }
  }
};
</script>
  
<style>
  .chart {
    width: 70%;
    margin: auto;
  }
</style>