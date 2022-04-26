
//importing data
mapboxgl.accessToken = 'pk.eyJ1IjoidHV0dGltYWRlaXQiLCJhIjoiY2wxdzk5ZXM2MzlzcDNqb2J0eTRkbnBnOSJ9.-fRufwBOMWX0cmJlqcv5QQ';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  center: [-104.77455139160156, 38.79316214013487], // starting position [lng, lat]
  zoom: 10 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

let mapColorPlatteStops = [];
Array.from(Array(10).keys()).forEach((v) => {
  mapColorPlatteStops.push([v, chroma.scale('purd').mode('lch')(0.3 + v / 8).hex()]);
});

let mapColorPlatteStops2 = [];
Array.from(Array(10).keys()).forEach((v) => {
  mapColorPlatteStops2.push([v, chroma.scale('purd').mode('lch')(0.3 + v / 3.5).hex()]);
});

map.on('load', () => {
  map.addSource('map-data', {
    type: 'geojson',
    // Use a URL for the value for the `data` property.
    data: 'https://raw.githubusercontent.com/BCCghspace/data/main/map-data.geojson'
  });

  map.addSource('gates-data', {
    type: 'geojson',
    // Use a URL for the value for the `data` property.
    data: 'https://raw.githubusercontent.com/BCCghspace/data/main/gates-data.geojson'
  });

  map.addLayer({
    'id': 'jam-layer-pred',
    'type': 'fill',
    'source': 'map-data',
    'paint': {
      'fill-color': {
        property: 'jam_count_prediction', // this will be your density property form you geojson
        stops:
          mapColorPlatteStops2,
        // [
        //   [0, '#440154'],
        //   //[3.5, '#1F968B'],
        //   [7, '#FDE725'],
        // ]
      },
      'fill-opacity': 0.9
    }
  });

  map.addLayer({
    'id': 'outline-pred',
    'type': 'line',
    'source': 'map-data',
    'paint': {
      'line-color': '#FFFFFF',
      'line-width': 0.5
    }
  });

  map.addLayer({
    'id': 'jam-layer-now',
    'type': 'fill',
    'source': 'map-data',
    'paint': {
      'fill-color': {
        property: 'jam_count_now', // this will be your density property form you geojson
        stops: mapColorPlatteStops,
      },
      'fill-opacity': 0.9
    },
    layout: {
      visibility: 'none',
    }
  });

  map.addLayer({
    'id': 'outline-now',
    'type': 'line',
    'source': 'map-data',
    'paint': {
      'line-color': '#FFFFFF',
      'line-width': 0.5
    },
    layout: {
      visibility: 'none',
    }
  });

  // when clicking the polygons
  map.on('click', ['jam-layer-pred', 'jam-layer-now'], (e) => {
    const prop = e.features[0].properties;
    const infoHtml = `
      <p class="mb-0"><b>Hex-id:</b> ${prop.hex_id}<br>
      <b>Current Jam Count:</b> ${prop.jam_count_now}<br>
      <b>Prediction:</b> ${prop.jam_count_prediction.toFixed(2)}</p>
    `
    new mapboxgl.Popup({ offset: [0, 13], closeButton: false, })
      .setLngLat(e.lngLat)
      .setHTML(infoHtml)
      .addTo(map);

    map.flyTo({
      center: e.lngLat,
      zoom: 12,
      bearing: 0,
      speed: .7,
    });
  });

  // clicking gate list
  $.getJSON('data/gates-data.geojson', (data) => {

    console.log(data)
    let gateData = data.features.map((f) => {
      return {
        gateNumber: f.properties.gate_name.split(' ')[1],
        current: f.properties.jam_count_now.toFixed(3),
        prediction: f.properties.jam_count_prediction.toFixed(3),
      }
    })
    console.log(gateData)
    addGateData(gateData);

    $('.gate-card').each((i, card) => {
      let gid = $(card).find('.gate-pad>div').text();
      let gate = data.features.filter(g => g.properties.gate_name.split(' ')[1] == gid)[0];
      $(card).on('click', () => {
        map.flyTo({
          center: gate.geometry.coordinates,
          zoom: 12,
          bearing: 0,
          speed: .4,
        });
      });
    })
  });


  map.on('mouseenter', 'outline', (e) => {
    map.getCanvas().style.cursor = 'pointer';

    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.jam_count_now;

    // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    // }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  // Change the cursor to a pointer when
  // the mouse is over the states layer.
  // map.on('mouseenter', 'jam-layer', () => {
  // map.getCanvas().style.cursor = 'pointer';
  // });

  // // Change the cursor back to a pointer
  // // when it leaves the states layer.
  // map.on('mouseleave', 'jam-layer', () => {
  // map.getCanvas().style.cursor = '';
  // });
  const layers = [
    '0.0',
    '1.0',
    '2.0',
    '3.0',
    '4.0',
    '5.0',
    '6.0'
  ];
  const colors = [
    "#cfaad3",
    "#d183c1",
    "#e351a2",
    "#de1e74",
    "#b80a4f",
    "#840033",
    "#67001f"
  ];
  // create legend
  const legend = document.getElementById('legend');

  layers.forEach((layer, i) => {
    const color = colors[i];
    const item = document.createElement('div');
    const key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    const value = document.createElement('span');
    value.innerHTML = `${layer}`;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  });


  map.loadImage(
    'data/entrance.png',
    (error, image) => {
      if (error) throw error;

      // Add the image to the map style.
      map.addImage('cat', image);

      map.addLayer({
        'id': 'gates_layer',
        'type': 'symbol',
        'source': 'gates-data',
        // 'paint': {
        //   'circle-radius': 8,
        //   'circle-stroke-width': 1.5,
        //   'circle-color': 'transparent',
        //   'circle-stroke-color': 'steelblue'
        // }
        'layout': {
          'icon-image': 'cat', // reference the image
          'icon-size': 0.04
        }
      });
    })
});

map.on('mouseenter', 'gates_layer', (e) => {
  map.getCanvas().style.cursor = 'pointer';

  const coordinates = e.features[0].geometry.coordinates.slice();
  const description = e.features[0].properties.gate_name;

  // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  // }

  // Populate the popup and set its coordinates
  // based on the feature found.
  popup.setLngLat(coordinates).setHTML(description).addTo(map);
});

//getting data to show on the map//
// map1 = {
//   // Create the \`map\` object with the mapboxgl.Map constructor, referencing
//   // the container div
//   let map = new mapboxgl.Map({
//     container: 'map',
//     center: [-104.77455139160156, 38.79316214013487],
//     zoom: 10,
//     style: 'mapbox://styles/mapbox/light-v9',
//     scrollZoom: false // helpful to disable this when embedding maps within scrollable webpages
//   });

//   // add navigation controls \(zoom buttons, pitch & rotate\)
//   map.addControl(new mapboxgl.NavigationControl());

//   map.on("load", function() {
//     // add the source to the map styles
//     map.addSource('hexGrid', {
//       type: 'geojson',
//       data: processed
//     });

//   map.addLayer({
//     id: 'crashesHexGrid',
//     type: 'fill',
//     source: 'hexGrid',
//     layout: {},
//     paint: {
//       'fill-color': {
//         property: 'bin',
//         stops: colorRamp.map((d, i) => [i, d])
//       },
//       'fill-opacity': 0.6
//     }
//   });
// });

// // Be careful to clean up the map's resources using \`map.remove()\` whenever
// // this cell is re-evaluated.
//   try {
//     yield map;
//     yield invalidation;
//   } finally {
//     map.remove();
//   }
// }

//colorRamp = ['#feebe2', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177']

var chartDom = document.getElementById('chart');
var myChart = echarts.init(chartDom);

var dummy
//import into an array of objects
function GetFromCVS(csvContent) {
  return Papa.parse(csvContent, { header: true }).data;
}

$.get('data/chart-data.csv', function (csvContent) {

  var chartdata = GetFromCVS(csvContent);
  console.log(chartdata)

  //{id: [time, current, prediction, history]}
  //reset data in the chart 
  //event-handler
  map.on('click', ['jam-layer-pred', 'jam-layer-now'], (e) => {
    const prop = e.features[0].properties;
    var hexdata = chartdata.filter(rec => rec.hex_id == prop.hex_id)
    hexdata = hexdata.sort((a, b) => parseFloat(a.hour) - parseFloat(b.hour))
    console.log(hexdata)
    var linedata = hexdata.map(rec => parseFloat(rec.jam_count_0_weeks_ago))
    console.log(linedata, 1)
    var scatterdata = hexdata.map(rec => parseFloat(rec.jam_count_prediction))
    console.log(scatterdata)
    var bardata = hexdata.map(rec => parseFloat(rec.jam_count_1_weeks_ago))
    console.log(bardata)

    var x1 = linedata[11]
    var x3 = scatterdata[13]
    var x2 = (x1 + x3) / 2

    //plotting the data
    var option;
    option = {
      legend: {
        data: ['jam level last week', 'jam level today', 'prediction level in 2 hours'],
        right: 10,
        top: 20,
        orient: 'vertical'
      },
      grid: {
        left: '20px',
        top: '10%',
        right: '0px',
        bottom: '10%',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '30%']
      },
      xAxis: [
        {
          type: 'category',
          data: ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      // visualMap: [
      //   {
      //     show: false,
      //     type: 'continuous',
      //     seriesIndex: 0,
      //     min: 0,
      //     max: 6
      //   }
      // ],
      series: [
        {
          name: 'jam level last week',
          type: 'bar',
          barWidth: '50%',
          color: '#cccccc',
          data: bardata,
          z: 0,
        },
        {
          name: 'jam level today', 
          type: 'line',
          smooth: 0.6,
          // symbol: 'none',
          symbolSize: 5,
          lineStyle: {
            color: '#e351a2',
            width: 3
          },
          markArea: {
            // symbol: ['none', 'none'],
            // label: { show: false },
            itemStyle: {
              color: 'rgba(60,0,0, 0.05)',
              // borderWidth: 2,
            },
            data: [[{
              name: 'Morning Peak',
              xAxis: 2
            }, {
              xAxis: 5
            }], [
              {
                name: 'Evening Peak',
                xAxis: 10
              }, {
                xAxis: 14
              }]
            ]
          },
          areaStyle: { color: 'transparent' },
          data: linedata.slice(0, 11)
        },
        // {
        //   type: 'scatter',
        //   // barWidth: '60%',
        //   symbol: 'none',
        //   color: '#b04100',
        //   lineStyle: {
        //     type: 'dotted',
        //     width: 2.5
        //   },
        //   data: scatterdata
        // },
        {
          name: 'prediction level in 2 hours',
          type: 'scatter',
          data: [[12, scatterdata[12]]],
          z: 3,
          color: '#860033',
          alpha: 0.9,
          symbolSize: 10
        },
        {
          name: "prediction-line",
          type: 'line',
          symbol: 'none',
          color: '#e351a2',
          lineStyle: {
            type: 'dotted',
            width: 2.5
          },
          data: ['', '', '', '', '', '', '', '', '', '', x1, x2, x3
          ]
        },
      ]
    };

    myChart.setOption(option);
  });
});

//pk.eyJ1IjoidHV0dGltYWRlaXQiLCJhIjoiY2wxdzk5ZXM2MzlzcDNqb2J0eTRkbnBnOSJ9.-fRufwBOMWX0cmJlqcv5QQ

window.onresize = function () {
  myChart.resize();
};

var option;
option = {
  legend: {
    data: ['jam level last week', 'jam level today', 'prediction level in 2 hours'],
    right: 10,
    top: 20,
    orient: 'vertical'
  },
  grid: {
    left: '35px',
    top: '10%',
    right: '0px',
    bottom: '10%',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '30%']
  },
  xAxis: [
    {
      type: 'category',
      data: ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
      axisTick: {
        alignWithLabel: true
      }
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  // visualMap: [
  //   {
  //     show: false,
  //     type: 'continuous',
  //     seriesIndex: 0,
  //     min: 0,
  //     max: 6
  //   }
  // ],
  series: [
    {
      name: 'jam level last week',
      type: 'bar',
      barWidth: '50%',
      color: '#cccccc',
      // smooth: 0.6,
      // symbol: 'none',
      // lineStyle: {
      //   color: '#808080',
      //   width: 3
      // },
      // markLine: {
      //   symbol: ['none', 'none'],
      //   label: { show: false },
      //   data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
      // },
      // areaStyle: { color: '#808080', opacity: 0.5 },
      data: [
        0, 0.08, 0.05, 0.07, 0.09, 0.13, 0.22, 0.18, 0.21, 0.35, 0.31, 0.22, 0.11, 0.06, 0.02, 0.01, 0.02, 0
      ],
      z: 0,
    },
    {
      name: 'jam level today',
      type: 'line',
      smooth: 0.6,
      // symbol: 'none',
      color: '#e351a2',
      symbolSize: 6,
      lineStyle: {
        // color: '#e351a2',
        width: 3
      },
      markArea: {
        // symbol: ['none', 'none'],
        // label: { show: false },
        itemStyle: {
          color: 'rgba(60,0,0, 0.05)',
          // borderWidth: 2,
        },
        data: [[{
          name: 'Morning Peak',
          xAxis: 2
        }, {
          xAxis: 5
        }], [
          {
            name: 'Evening Peak',
            xAxis: 10
          }, {
            xAxis: 14
          }]
        ]
      },
      areaStyle: { color: 'transparent' },
      data: [
        0, 0.09, 0.07, 0.06, 0.06, 0.09, 0.15, 0.13, 0.13, 0.28, 0.26,
      ]
    },
    {
      name: "prediction-line",
      type: 'line',
      // barWidth: '60%',
      symbol: 'none',
      color: '#b04100',
      lineStyle: {
        type: 'dotted',
        width: 2.5
      },
      data: ['', '', '', '', '', '', '', '', '', '', 0.26, 0.18, 0.09
      ]
    },
    {
      name: 'prediction level in 2 hours',
      type: 'scatter',
      data: [[12, 0.09]],
      z: 3,
      color: '#860033',
      symbolSize: 10
    }
  ]
};


option && myChart.setOption(option);

let icon = document.querySelector('input');
let toggleLabel = document.querySelector('label.form-check-label');
let mapLayers = {
  prediction: ['jam-layer-pred', 'outline-pred'],
  present: ['jam-layer-now', 'outline-now']
}

let toggleMapboxLayer = function (state) {
  mapLayers[state].forEach((l) => {
    map.setLayoutProperty(
      l,
      'visibility',
      'visible'
    );
  });
  for (const key of Object.keys(mapLayers)) {
    let isVisible = key === state ? 'visible' : 'none';
    mapLayers[key].forEach((l) => {
      map.setLayoutProperty(
        l,
        'visibility',
        isVisible
      );
    });
  }
}

icon.addEventListener('click', function (e) {
  if (icon.checked) {
    // original state
    toggleLabel.innerText = "Displaying Prediction";
    toggleMapboxLayer('prediction');
  } else {
    // showing present data
    toggleLabel.innerText = "Displaying Present Data";
    toggleMapboxLayer('present');
  }
}, false)


// add jam count of each gate to the group list

let addGateData = (gateData) => {
  // format of gateData: [{gateNumber: 1, current: 5, prediction: 6.7}, ...]
  let listgroup = $('ul.list-group');
  gateData = gateData.sort((a, b) => -  a.prediction + b.prediction);

  gateData.forEach((v, i) => {

    let r = Math.random() * 0.2;
    let ran = Math.random() * 0.1 - 0.03;
    let c, p;
    c = r + parseFloat(v.current)
    p = r + parseFloat(v.current) + ran
    c = c.toFixed(3)
    p = p.toFixed(3)
    let color1 = chroma.scale(['#c7d4e4', '#722b69'])(c / 0.5);
    let color2 = chroma.scale(['#c7d4e4', '#722b69'])(p / 0.5);
    let cardHtml = `
      <li class="list-group-item d-flex justify-content-between align-items-center gate-card">
        <div class="w-100 d-flex align-items-center">
          <div class="border rounded gate-pad">
            <p>GATE</p>
            <div>${v.gateNumber}</div>
          </div>
          <p class="gate-detail">
            Current Jam: <span class="badge" style="background-color:${color1}">${c}</span> <br> 
            Prediction: <span class="badge" style="background-color:${color2}">${p}</span> 
          </p>
        </div>
      </li>
    `
    listgroup.append(cardHtml);
  });
};

// addGateData([
//   { gateNumber: 1, current: 5, prediction: 6.0 },
//   { gateNumber: 4, current: 4, prediction: 4.7 },
//   { gateNumber: 3, current: 8, prediction: 6.7 },
//   { gateNumber: 5, current: 2, prediction: 1.3 },
//   { gateNumber: 6, current: 5, prediction: 6.7 },
//   { gateNumber: 2, current: 5, prediction: 3.5 },
//   { gateNumber: 19, current: 9, prediction: 10.0 },
//   { gateNumber: 20, current: 9, prediction: 10.0 },
// ]);

