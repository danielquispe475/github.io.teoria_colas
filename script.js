// script.js
document.addEventListener('DOMContentLoaded', function() {
    const simulationForm = document.getElementById('simulation-form');
    const resultsSection = document.getElementById('results-section');
    const tableContainer = document.getElementById('table-container');
    const statisticsContainer = document.getElementById('statistics');
    
    simulationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const arrivalRate = parseFloat(document.getElementById('arrival-rate').value);
        const serviceRate = parseFloat(document.getElementById('service-rate').value);
        const iterations = parseInt(document.getElementById('iterations').value);
        const servers = parseInt(document.getElementById('servers').value);
        
        if (isNaN(arrivalRate) || isNaN(serviceRate) || isNaN(iterations) || 
            arrivalRate <= 0 || serviceRate <= 0 || iterations <= 0) {
            alert('❌ Por favor, ingrese valores válidos mayores a cero.');
            return;
        }
        
        const simulationData = runSimulation(arrivalRate, serviceRate, iterations, servers);
        displayResults(simulationData, servers);
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    function runSimulation(arrivalRate, serviceRate, iterations, servers) {
        const data = [];
        
        if (servers === 1) {
            // COHERENTE con Hoja1_replanteada_final.xlsx
            let previousFinishTime = 0; // H10, H11, etc.
            
            for (let i = 0; i < iterations; i++) {
                // B10, B11, etc. =RAND()
                const randomArrival = Math.random();
                
                // C10, C11, etc. =-LN(1-B10)/D$3*60
                const interarrivalTime = -Math.log(1 - randomArrival) / arrivalRate * 60;
                
                // D10, D11, etc. (D10=C10, D11=D10+C11)
                const arrivalTime = i === 0 ? interarrivalTime : data[i-1].tiempoLlegada + interarrivalTime;
                
                // E10, E11, etc. =MAX(D11,H10)
                const serviceStartTime = Math.max(arrivalTime, previousFinishTime);
                
                // F10, F11, etc. =E10-D10
                const waitingTime = serviceStartTime - arrivalTime;
                
                // G10, G11, etc. =-LN(1-RAND())/D$4*60
                const serviceTime = -Math.log(1 - Math.random()) / serviceRate * 60;
                
                // H10, H11, etc. =D10+G10
                const finishTime = serviceStartTime + serviceTime;
                
                // I10, I11, etc. =F10+G10
                const systemTime = waitingTime + serviceTime;
                
                // J10, J11, etc. =E11-H10
                const idleTime = i === 0 ? serviceStartTime : serviceStartTime - previousFinishTime;
                
                previousFinishTime = finishTime;
                
                data.push({
                    numeracion: i + 1,
                    numeroAleatorio: randomArrival,
                    tiempoEntreLlegadas: parseFloat(interarrivalTime.toFixed(4)),
                    tiempoLlegada: parseFloat(arrivalTime.toFixed(4)),
                    tiempoInicioServicio: parseFloat(serviceStartTime.toFixed(4)),
                    tiempoEspera: parseFloat(Math.max(0, waitingTime).toFixed(4)),
                    tiempoServicio: parseFloat(serviceTime.toFixed(4)),
                    tiempoFinalizacion: parseFloat(finishTime.toFixed(4)),
                    tiempoSistema: parseFloat(systemTime.toFixed(4)),
                    tiempoOcio: parseFloat(Math.max(0, idleTime).toFixed(4))
                });
            }
        } else {
            // COHERENTE con Hoja2_full40.xlsx
            let finishTime1 = 0; // K9
            let finishTime2 = 0; // L9
            
            for (let i = 0; i < iterations; i++) {
                // B9, B10, etc. =RAND()
                const randomArrival = Math.random();
                
                // C9, C10, etc. =-LN(1-B10)/C$1*60
                const interarrivalTime = -Math.log(1 - randomArrival) / arrivalRate * 60;
                
                // D9, D10, etc. (D9=C9, D10=D9+C10)
                const arrivalTime = i === 0 ? interarrivalTime : data[i-1].tiempoLlegada + interarrivalTime;
                
                // E10, E11, etc. =IF(MIN(K9:L9)=K9,MAX(D10,K9),0)
                let serviceStart1 = 0;
                if (i === 0) {
                    serviceStart1 = arrivalTime; // Primer cliente va al servidor 1
                } else {
                    const minFinish = Math.min(finishTime1, finishTime2);
                    if (minFinish === finishTime1) {
                        serviceStart1 = Math.max(arrivalTime, finishTime1);
                    }
                }
                
                // F10, F11, etc. =IF(MIN(K9:L9)=L9,MAX(L9,D10),0)
                let serviceStart2 = 0;
                if (i > 0) {
                    const minFinish = Math.min(finishTime1, finishTime2);
                    if (minFinish === finishTime2) {
                        serviceStart2 = Math.max(arrivalTime, finishTime2);
                    }
                }
                
                // G10, G11, etc. =IF(E10>0,E10-D$9,0)
                const waitingTime1 = serviceStart1 > 0 ? serviceStart1 - arrivalTime : 0;
                
                // H10, H11, etc. =IF(F10>0,F10-E$9,0)
                const waitingTime2 = serviceStart2 > 0 ? serviceStart2 - arrivalTime : 0;
                
                // I10, I11, etc. =IF(E10>0,-LN(1-RAND())/C$4*60,0)
                const serviceTime1 = serviceStart1 > 0 ? -Math.log(1 - Math.random()) / serviceRate * 60 : 0;
                
                // J10, J11, etc. =IF(F10>0,-LN(1-RAND())/C$4*60,0)
                const serviceTime2 = serviceStart2 > 0 ? -Math.log(1 - Math.random()) / serviceRate * 60 : 0;
                
                // K10, K11, etc. =IF(E10>0,E10+I10,K9)
                const newFinishTime1 = serviceStart1 > 0 ? serviceStart1 + serviceTime1 : (i > 0 ? data[i-1].tiempoFinalizacion1 : 0);
                
                // L10, L11, etc. =IF(F10>0,F10+J10,L9)
                const newFinishTime2 = serviceStart2 > 0 ? serviceStart2 + serviceTime2 : (i > 0 ? data[i-1].tiempoFinalizacion2 : 0);
                
                // Actualizar para siguiente iteración
                if (serviceStart1 > 0) finishTime1 = newFinishTime1;
                if (serviceStart2 > 0) finishTime2 = newFinishTime2;
                
                // M10, M11, etc. =G10+H10+I10+J10
                const systemTime = waitingTime1 + waitingTime2 + serviceTime1 + serviceTime2;
                
                // N10, N11, etc. =IF(E10>0,E10-I9,0)
                let idleTime1 = 0;
                if (i === 0) {
                    idleTime1 = serviceStart1;
                } else if (serviceStart1 > 0) {
                    idleTime1 = serviceStart1 - (data[i-1].tiempoFinalizacion1 || 0);
                }
                
                // O10, O11, etc. =IF(F10>0,F10-J9,0)
                let idleTime2 = 0;
                if (serviceStart2 > 0 && i > 0) {
                    idleTime2 = serviceStart2 - (data[i-1].tiempoFinalizacion2 || 0);
                }
                
                data.push({
                    numeracion: i + 1,
                    numeroAleatorio: randomArrival,
                    tiempoEntreLlegadas: parseFloat(interarrivalTime.toFixed(4)),
                    tiempoLlegada: parseFloat(arrivalTime.toFixed(4)),
                    tiempoInicioServicio1: parseFloat(serviceStart1.toFixed(4)),
                    tiempoInicioServicio2: parseFloat(serviceStart2.toFixed(4)),
                    tiempoEspera1: parseFloat(Math.max(0, waitingTime1).toFixed(4)),
                    tiempoEspera2: parseFloat(Math.max(0, waitingTime2).toFixed(4)),
                    tiempoServicio1: parseFloat(serviceTime1.toFixed(4)),
                    tiempoServicio2: parseFloat(serviceTime2.toFixed(4)),
                    tiempoFinalizacion1: parseFloat(newFinishTime1.toFixed(4)),
                    tiempoFinalizacion2: parseFloat(newFinishTime2.toFixed(4)),
                    tiempoSistema: parseFloat(systemTime.toFixed(4)),
                    tiempoOcio1: parseFloat(Math.max(0, idleTime1).toFixed(4)),
                    tiempoOcio2: parseFloat(Math.max(0, idleTime2).toFixed(4))
                });
            }
        }
        
        return data;
    }
    
    function displayResults(data, servers) {
        let tableHTML = `<table class="simulation-table">`;
        
        if (servers === 1) {
            tableHTML += `
                <thead>
                    <tr>
                        <th>Numeración</th>
                        <th>N° Aleatorio</th>
                        <th>Tiempo Entre Llegadas (min)</th>
                        <th>Tiempo de Llegada</th>
                        <th>Tiempo Inicio Servicio</th>
                        <th>Tiempo de Espera</th>
                        <th>Tiempo de Servicio (min)</th>
                        <th>Tiempo Finalización Servicio</th>
                        <th>Tiempo en el Sistema</th>
                        <th>Tiempo Ocio</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            data.forEach(row => {
                tableHTML += `
                    <tr>
                        <td>${row.numeracion}</td>
                        <td>${row.numeroAleatorio.toFixed(4)}</td>
                        <td>${row.tiempoEntreLlegadas}</td>
                        <td>${row.tiempoLlegada}</td>
                        <td>${row.tiempoInicioServicio}</td>
                        <td>${row.tiempoEspera}</td>
                        <td>${row.tiempoServicio}</td>
                        <td>${row.tiempoFinalizacion}</td>
                        <td>${row.tiempoSistema}</td>
                        <td>${row.tiempoOcio}</td>
                    </tr>
                `;
            });
        } else {
            tableHTML += `
                <thead>
                    <tr>
                        <th>Numeración</th>
                        <th>N° Aleatorio</th>
                        <th>Tiempo Entre Llegadas (min)</th>
                        <th>Tiempo de Llegada</th>
                        <th>Tiempo Inicio Servicio 1</th>
                        <th>Tiempo Inicio Servicio 2</th>
                        <th>Tiempo de Espera 1</th>
                        <th>Tiempo de Espera 2</th>
                        <th>Tiempo de Servicio 1 (min)</th>
                        <th>Tiempo de Servicio 2 (min)</th>
                        <th>Tiempo Finalización Servicio 1</th>
                        <th>Tiempo Finalización Servicio 2</th>
                        <th>Tiempo en el Sistema</th>
                        <th>Tiempo Ocio 1</th>
                        <th>Tiempo Ocio 2</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            data.forEach(row => {
                tableHTML += `
                    <tr>
                        <td>${row.numeracion}</td>
                        <td>${row.numeroAleatorio.toFixed(4)}</td>
                        <td>${row.tiempoEntreLlegadas}</td>
                        <td>${row.tiempoLlegada}</td>
                        <td>${row.tiempoInicioServicio1}</td>
                        <td>${row.tiempoInicioServicio2}</td>
                        <td>${row.tiempoEspera1}</td>
                        <td>${row.tiempoEspera2}</td>
                        <td>${row.tiempoServicio1}</td>
                        <td>${row.tiempoServicio2}</td>
                        <td>${row.tiempoFinalizacion1}</td>
                        <td>${row.tiempoFinalizacion2}</td>
                        <td>${row.tiempoSistema}</td>
                        <td>${row.tiempoOcio1}</td>
                        <td>${row.tiempoOcio2}</td>
                    </tr>
                `;
            });
        }
        
        tableHTML += `</tbody></table>`;
        tableContainer.innerHTML = tableHTML;
        displayStatistics(data, servers);
    }
    
    function displayStatistics(data, servers) {
        let statsHTML = '';
        
        if (servers === 1) {
            const totalWaitingTime = data.reduce((sum, row) => sum + row.tiempoEspera, 0);
            const totalServiceTime = data.reduce((sum, row) => sum + row.tiempoServicio, 0);
            const totalSystemTime = data.reduce((sum, row) => sum + row.tiempoSistema, 0);
            const totalIdleTime = data.reduce((sum, row) => sum + row.tiempoOcio, 0);
            const lastFinishTime = data[data.length - 1].tiempoFinalizacion;
            
            const avgWaitingTime = totalWaitingTime / data.length;
            const avgServiceTime = totalServiceTime / data.length;
            const avgSystemTime = totalSystemTime / data.length;
            const utilization = lastFinishTime > 0 ? ((lastFinishTime - totalIdleTime) / lastFinishTime * 100) : 0;
            
            statsHTML = `
                <div class="stat-card">
                    <h3>⏱️ Tiempo Promedio de Espera</h3>
                    <div class="stat-value">${avgWaitingTime.toFixed(2)} min</div>
                    <p class="stat-description">Tiempo promedio en cola</p>
                </div>
                <div class="stat-card">
                    <h3>⚡ Tiempo Promedio de Servicio</h3>
                    <div class="stat-value">${avgServiceTime.toFixed(2)} min</div>
                    <p class="stat-description">Tiempo promedio de atención</p>
                </div>
                <div class="stat-card">
                    <h3>🔄 Tiempo Promedio en Sistema</h3>
                    <div class="stat-value">${avgSystemTime.toFixed(2)} min</div>
                    <p class="stat-description">Tiempo total en el sistema</p>
                </div>
                <div class="stat-card">
                    <h3>📊 Utilización</h3>
                    <div class="stat-value">${utilization.toFixed(2)}%</div>
                    <p class="stat-description">Porcentaje de uso del servidor</p>
                </div>
            `;
        } else {
            const totalWaitingTime = data.reduce((sum, row) => sum + row.tiempoEspera1 + row.tiempoEspera2, 0);
            const totalServiceTime = data.reduce((sum, row) => sum + row.tiempoServicio1 + row.tiempoServicio2, 0);
            const totalSystemTime = data.reduce((sum, row) => sum + row.tiempoSistema, 0);
            const totalIdleTime1 = data.reduce((sum, row) => sum + row.tiempoOcio1, 0);
            const totalIdleTime2 = data.reduce((sum, row) => sum + row.tiempoOcio2, 0);
            
            const lastFinishTime = Math.max(
                data[data.length - 1].tiempoFinalizacion1 || 0, 
                data[data.length - 1].tiempoFinalizacion2 || 0
            );
            
            const avgWaitingTime = totalWaitingTime / data.length;
            const avgServiceTime = totalServiceTime / data.length;
            const avgSystemTime = totalSystemTime / data.length;
            const utilization1 = lastFinishTime > 0 ? ((lastFinishTime - totalIdleTime1) / lastFinishTime * 100) : 0;
            const utilization2 = lastFinishTime > 0 ? ((lastFinishTime - totalIdleTime2) / lastFinishTime * 100) : 0;
            const avgUtilization = (utilization1 + utilization2) / 2;
            
            statsHTML = `
                <div class="stat-card">
                    <h3>⏱️ Tiempo Promedio de Espera</h3>
                    <div class="stat-value">${avgWaitingTime.toFixed(2)} min</div>
                    <p class="stat-description">Tiempo promedio en cola</p>
                </div>
                <div class="stat-card">
                    <h3>⚡ Tiempo Promedio de Servicio</h3>
                    <div class="stat-value">${avgServiceTime.toFixed(2)} min</div>
                    <p class="stat-description">Tiempo promedio de atención</p>
                </div>
                <div class="stat-card">
                    <h3>🔄 Tiempo Promedio en Sistema</h3>
                    <div class="stat-value">${avgSystemTime.toFixed(2)} min</div>
                    <p class="stat-description">Tiempo total en el sistema</p>
                </div>
                <div class="stat-card">
                    <h3>📊 Utilización Promedio</h3>
                    <div class="stat-value">${avgUtilization.toFixed(2)}%</div>
                    <p class="stat-description">Uso promedio de servidores</p>
                </div>
                <div class="stat-card">
                    <h3>👤 Utilización Servidor 1</h3>
                    <div class="stat-value">${utilization1.toFixed(2)}%</div>
                    <p class="stat-description">Uso del servidor 1</p>
                </div>
                <div class="stat-card">
                    <h3>👥 Utilización Servidor 2</h3>
                    <div class="stat-value">${utilization2.toFixed(2)}%</div>
                    <p class="stat-description">Uso del servidor 2</p>
                </div>
            `;
        }
        
        statisticsContainer.innerHTML = statsHTML;
    }
});
