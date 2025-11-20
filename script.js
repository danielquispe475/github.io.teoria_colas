document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let selectedServers = 1;
    let currentSimulationData = [];
    let currentHeaders = [];
    
    // Selección de servidores
    const serverOptions = document.querySelectorAll('.server-option');
    const serverCountDisplay = document.getElementById('server-count-display');
    
    serverOptions.forEach(option => {
        option.addEventListener('click', function() {
            serverOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedServers = parseInt(this.getAttribute('data-servers'));
            serverCountDisplay.textContent = `${selectedServers} Servidor${selectedServers > 1 ? 'es' : ''}`;
        });
    });
    
    // Botón de generación
    document.getElementById('generate-btn').addEventListener('click', generateSimulation);
    
    // Botón de descarga CSV - MODIFICADO
    document.getElementById('download-btn').addEventListener('click', function() {
        alert('Próximamente se desarrollará una hoja en blanco');
    });
    
    // Generar simulación inicial
    generateSimulation();
    
    function generateSimulation() {
        const arrivalRate = parseFloat(document.getElementById('arrival-rate').value);
        const serviceRate = parseFloat(document.getElementById('service-rate').value);
        const iterations = parseInt(document.getElementById('iterations').value);
        
        if (selectedServers === 1) {
            generateSingleServerSimulation(arrivalRate, serviceRate, iterations);
        } else if (selectedServers === 2) {
            generateTwoServerSimulation(arrivalRate, serviceRate, iterations);
        } else {
            generateThreeServerSimulation(arrivalRate, serviceRate, iterations);
        }
        
        // Añadir animación
        const statsContainer = document.getElementById('stats-container');
        statsContainer.classList.remove('fade-in');
        void statsContainer.offsetWidth;
        statsContainer.classList.add('fade-in');
    }
    
    function generateSingleServerSimulation(arrivalRate, serviceRate, iterations) {
        const table = document.getElementById('simulation-table');
        table.innerHTML = '';
        currentSimulationData = [];
        currentHeaders = [
            'Numeración', 'Número aleatorio', 'Tiempo entre llegadas (min)', 
            'Tiempo de llegada', 'Tiempo de inicio servicio', 'Tiempo de espera',
            'Número aleatorio servicio', 'Tiempo de servicio (min)', 
            'Tiempo de finalización de servicio', 'Tiempo en el sistema', 'Tiempo ocio'
        ];
        
        // Crear encabezado
        const headerRow = document.createElement('tr');
        currentHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = 'header-cell';
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Variables para cálculos
        let arrivalTimes = [0];
        let serviceStartTimes = [0];
        let serviceEndTimes = [0];
        let serviceTimes = [0];
        let waitTimes = [0];
        let idleTimes = [0];
        
        // Primera fila (cliente 1)
        const randArrival1 = Math.random();
        const interarrivalTime1 = Math.max(0, -Math.log(1 - randArrival1) / arrivalRate * 60);
        arrivalTimes[0] = interarrivalTime1;
        
        const randService1 = Math.random();
        serviceTimes[0] = Math.max(0, -Math.log(1 - randService1) / serviceRate * 60);
        serviceStartTimes[0] = arrivalTimes[0];
        serviceEndTimes[0] = serviceStartTimes[0] + serviceTimes[0];
        waitTimes[0] = 0;
        idleTimes[0] = arrivalTimes[0];
        
        // Fila 1
        const row1 = document.createElement('tr');
        row1.innerHTML = `
            <td>1</td>
            <td class="formula-cell">${randArrival1.toFixed(4)}</td>
            <td class="time-cell">${interarrivalTime1.toFixed(2)}</td>
            <td class="time-cell">${arrivalTimes[0].toFixed(2)}</td>
            <td class="time-cell">${serviceStartTimes[0].toFixed(2)}</td>
            <td class="wait-cell">${waitTimes[0].toFixed(2)}</td>
            <td class="formula-cell">${randService1.toFixed(4)}</td>
            <td class="service-cell">${serviceTimes[0].toFixed(2)}</td>
            <td class="time-cell">${serviceEndTimes[0].toFixed(2)}</td>
            <td class="system-cell">${(waitTimes[0] + serviceTimes[0]).toFixed(2)}</td>
            <td class="idle-cell">${idleTimes[0].toFixed(2)}</td>
        `;
        table.appendChild(row1);
        
        // Filas siguientes
        for (let i = 2; i <= iterations; i++) {
            const randArrival = Math.random();
            const interarrivalTime = Math.max(0, -Math.log(1 - randArrival) / arrivalRate * 60);
            const arrivalTime = arrivalTimes[i-2] + interarrivalTime;
            
            // Determinar inicio de servicio (máximo entre llegada y fin servicio anterior)
            const serviceStartTime = Math.max(arrivalTime, serviceEndTimes[i-2]);
            const waitTime = Math.max(0, serviceStartTime - arrivalTime);
            
            const randService = Math.random();
            const serviceTime = Math.max(0, -Math.log(1 - randService) / serviceRate * 60);
            const serviceEndTime = serviceStartTime + serviceTime;
            
            // Tiempo de ocio (solo si el servidor está libre antes de que llegue el cliente)
            const idleTime = Math.max(0, arrivalTime - serviceEndTimes[i-2]);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td class="formula-cell">${randArrival.toFixed(4)}</td>
                <td class="time-cell">${interarrivalTime.toFixed(2)}</td>
                <td class="time-cell">${arrivalTime.toFixed(2)}</td>
                <td class="time-cell">${serviceStartTime.toFixed(2)}</td>
                <td class="wait-cell">${waitTime.toFixed(2)}</td>
                <td class="formula-cell">${randService.toFixed(4)}</td>
                <td class="service-cell">${serviceTime.toFixed(2)}</td>
                <td class="time-cell">${serviceEndTime.toFixed(2)}</td>
                <td class="system-cell">${(waitTime + serviceTime).toFixed(2)}</td>
                <td class="idle-cell">${idleTime.toFixed(2)}</td>
            `;
            
            table.appendChild(row);
            
            // Actualizar arrays para siguientes cálculos
            arrivalTimes.push(arrivalTime);
            serviceStartTimes.push(serviceStartTime);
            serviceEndTimes.push(serviceEndTime);
            serviceTimes.push(serviceTime);
            waitTimes.push(waitTime);
            idleTimes.push(idleTime);
        }
        
        // Generar estadísticas
        generateStats(arrivalRate, serviceRate, iterations, 1);
    }
    
    function generateTwoServerSimulation(arrivalRate, serviceRate, iterations) {
        const table = document.getElementById('simulation-table');
        table.innerHTML = '';
        currentSimulationData = [];
        currentHeaders = [
            'Numeración', 'Número aleatorio', 'Tiempo entre llegadas (min)', 
            'Tiempo de llegada', 'Tiempo inicio servicio 1', 'Tiempo inicio servicio 2',
            'Tiempo de espera 1', 'Tiempo de espera 2', 'Tiempo servicio 1 (min)', 
            'Tiempo servicio 2 (min)', 'Tiempo finalización servicio 1', 
            'Tiempo finalización servicio 2', 'Tiempo en el sistema', 
            'Tiempo ocio 1', 'Tiempo ocio 2'
        ];
        
        // Crear encabezado
        const headerRow = document.createElement('tr');
        currentHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = 'header-cell';
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Arrays para almacenar datos de cada servidor
        let serviceEndTime1 = 0;
        let serviceEndTime2 = 0;
        
        // Primera fila (cliente 1) - Siempre va al servidor 1
        const randArrival1 = Math.random();
        const interarrivalTime1 = Math.max(0, -Math.log(1 - randArrival1) / arrivalRate * 60);
        const arrivalTime1 = interarrivalTime1;
        
        const serviceStartTime1 = arrivalTime1;
        const idleTime1 = arrivalTime1;
        
        const randService1 = Math.random();
        const serviceTime1 = Math.max(0, -Math.log(1 - randService1) / serviceRate * 60);
        serviceEndTime1 = serviceStartTime1 + serviceTime1;
        
        const waitTime1 = 0;
        const waitTime2 = 0;
        
        // Fila 1
        const row1 = document.createElement('tr');
        row1.innerHTML = `
            <td>1</td>
            <td class="formula-cell">${randArrival1.toFixed(4)}</td>
            <td class="time-cell">${interarrivalTime1.toFixed(2)}</td>
            <td class="time-cell">${arrivalTime1.toFixed(2)}</td>
            <td class="time-cell">${serviceStartTime1.toFixed(2)}</td>
            <td class="time-cell">0.00</td>
            <td class="wait-cell">${waitTime1.toFixed(2)}</td>
            <td class="wait-cell">${waitTime2.toFixed(2)}</td>
            <td class="service-cell">${serviceTime1.toFixed(2)}</td>
            <td class="service-cell">0.00</td>
            <td class="time-cell">${serviceEndTime1.toFixed(2)}</td>
            <td class="time-cell">0.00</td>
            <td class="system-cell">${(waitTime1 + serviceTime1).toFixed(2)}</td>
            <td class="idle-cell">${idleTime1.toFixed(2)}</td>
            <td class="idle-cell">0.00</td>
        `;
        table.appendChild(row1);
        
        // Filas siguientes
        for (let i = 2; i <= iterations; i++) {
            const randArrival = Math.random();
            const interarrivalTime = Math.max(0, -Math.log(1 - randArrival) / arrivalRate * 60);
            const arrivalTime = (i === 2 ? arrivalTime1 : parseFloat(document.querySelector(`#simulation-table tr:nth-child(${i-1}) td:nth-child(4)`).textContent)) + interarrivalTime;
            
            let serviceStartTime1_current = 0;
            let serviceStartTime2_current = 0;
            let serviceTime1_current = 0;
            let serviceTime2_current = 0;
            let serviceEndTime1_current = serviceEndTime1;
            let serviceEndTime2_current = serviceEndTime2;
            let waitTime1_current = 0;
            let waitTime2_current = 0;
            let idleTime1_current = 0;
            let idleTime2_current = 0;
            
            // Determinar qué servidor atiende (el que termine primero)
            if (serviceEndTime1 <= serviceEndTime2) {
                // Servidor 1 atiende
                serviceStartTime1_current = Math.max(arrivalTime, serviceEndTime1);
                waitTime1_current = Math.max(0, serviceStartTime1_current - arrivalTime);
                
                const randService1 = Math.random();
                serviceTime1_current = Math.max(0, -Math.log(1 - randService1) / serviceRate * 60);
                serviceEndTime1_current = serviceStartTime1_current + serviceTime1_current;
                
                idleTime1_current = Math.max(0, serviceStartTime1_current - serviceEndTime1);
                
                // Servidor 2 no atiende
                serviceStartTime2_current = 0;
                serviceTime2_current = 0;
                serviceEndTime2_current = serviceEndTime2;
                waitTime2_current = 0;
                idleTime2_current = 0;
                
                // Actualizar para siguiente iteración
                serviceEndTime1 = serviceEndTime1_current;
            } else {
                // Servidor 2 atiende
                serviceStartTime2_current = Math.max(arrivalTime, serviceEndTime2);
                waitTime2_current = Math.max(0, serviceStartTime2_current - arrivalTime);
                
                const randService2 = Math.random();
                serviceTime2_current = Math.max(0, -Math.log(1 - randService2) / serviceRate * 60);
                serviceEndTime2_current = serviceStartTime2_current + serviceTime2_current;
                
                idleTime2_current = Math.max(0, serviceStartTime2_current - serviceEndTime2);
                
                // Servidor 1 no atiende
                serviceStartTime1_current = 0;
                serviceTime1_current = 0;
                serviceEndTime1_current = serviceEndTime1;
                waitTime1_current = 0;
                idleTime1_current = 0;
                
                // Actualizar para siguiente iteración
                serviceEndTime2 = serviceEndTime2_current;
            }
            
            const systemTime = (waitTime1_current + serviceTime1_current + waitTime2_current + serviceTime2_current);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td class="formula-cell">${randArrival.toFixed(4)}</td>
                <td class="time-cell">${interarrivalTime.toFixed(2)}</td>
                <td class="time-cell">${arrivalTime.toFixed(2)}</td>
                <td class="time-cell">${serviceStartTime1_current.toFixed(2)}</td>
                <td class="time-cell">${serviceStartTime2_current.toFixed(2)}</td>
                <td class="wait-cell">${waitTime1_current.toFixed(2)}</td>
                <td class="wait-cell">${waitTime2_current.toFixed(2)}</td>
                <td class="service-cell">${serviceTime1_current.toFixed(2)}</td>
                <td class="service-cell">${serviceTime2_current.toFixed(2)}</td>
                <td class="time-cell">${serviceEndTime1_current.toFixed(2)}</td>
                <td class="time-cell">${serviceEndTime2_current.toFixed(2)}</td>
                <td class="system-cell">${systemTime.toFixed(2)}</td>
                <td class="idle-cell">${idleTime1_current.toFixed(2)}</td>
                <td class="idle-cell">${idleTime2_current.toFixed(2)}</td>
            `;
            
            table.appendChild(row);
        }
        
        // Generar estadísticas
        generateStats(arrivalRate, serviceRate, iterations, 2);
    }
    
    function generateThreeServerSimulation(arrivalRate, serviceRate, iterations) {
        const table = document.getElementById('simulation-table');
        table.innerHTML = '';
        currentSimulationData = [];
        currentHeaders = [
            'Numeración', 'Número aleatorio', 'Tiempo entre llegadas (min)', 
            'Tiempo de llegada', 'Tiempo inicio servicio 1', 'Tiempo inicio servicio 2',
            'Tiempo inicio servicio 3', 'Tiempo de espera 1', 'Tiempo de espera 2',
            'Tiempo de espera 3', 'Tiempo servicio 1 (min)', 'Tiempo servicio 2 (min)',
            'Tiempo servicio 3 (min)', 'Tiempo finalización servicio 1',
            'Tiempo finalización servicio 2', 'Tiempo finalización servicio 3',
            'Tiempo en el sistema', 'Tiempo ocio 1', 'Tiempo ocio 2', 'Tiempo ocio 3'
        ];
        
        // Crear encabezado
        const headerRow = document.createElement('tr');
        currentHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = 'header-cell';
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Arrays para almacenar datos de cada servidor
        let serviceEndTime1 = 0;
        let serviceEndTime2 = 0;
        let serviceEndTime3 = 0;
        
        // Primera fila (cliente 1) - Siempre va al servidor 1
        const randArrival1 = Math.random();
        const interarrivalTime1 = Math.max(0, -Math.log(1 - randArrival1) / arrivalRate * 60);
        const arrivalTime1 = interarrivalTime1;
        
        const serviceStartTime1 = arrivalTime1;
        const idleTime1 = arrivalTime1;
        
        const randService1 = Math.random();
        const serviceTime1 = Math.max(0, -Math.log(1 - randService1) / serviceRate * 60);
        serviceEndTime1 = serviceStartTime1 + serviceTime1;
        
        // Fila 1
        const row1 = document.createElement('tr');
        row1.innerHTML = `
            <td>1</td>
            <td class="formula-cell">${randArrival1.toFixed(4)}</td>
            <td class="time-cell">${interarrivalTime1.toFixed(2)}</td>
            <td class="time-cell">${arrivalTime1.toFixed(2)}</td>
            <td class="time-cell">${serviceStartTime1.toFixed(2)}</td>
            <td class="time-cell">0.00</td>
            <td class="time-cell">0.00</td>
            <td class="wait-cell">0.00</td>
            <td class="wait-cell">0.00</td>
            <td class="wait-cell">0.00</td>
            <td class="service-cell">${serviceTime1.toFixed(2)}</td>
            <td class="service-cell">0.00</td>
            <td class="service-cell">0.00</td>
            <td class="time-cell">${serviceEndTime1.toFixed(2)}</td>
            <td class="time-cell">0.00</td>
            <td class="time-cell">0.00</td>
            <td class="system-cell">${serviceTime1.toFixed(2)}</td>
            <td class="idle-cell">${idleTime1.toFixed(2)}</td>
            <td class="idle-cell">0.00</td>
            <td class="idle-cell">0.00</td>
        `;
        table.appendChild(row1);
        
        // Filas siguientes
        for (let i = 2; i <= iterations; i++) {
            const randArrival = Math.random();
            const interarrivalTime = Math.max(0, -Math.log(1 - randArrival) / arrivalRate * 60);
            const arrivalTime = (i === 2 ? arrivalTime1 : parseFloat(document.querySelector(`#simulation-table tr:nth-child(${i-1}) td:nth-child(4)`).textContent)) + interarrivalTime;
            
            // Determinar qué servidor atiende (el que termine primero)
            const endTimes = [serviceEndTime1, serviceEndTime2, serviceEndTime3];
            const minEndTime = Math.min(...endTimes);
            const serverToUse = endTimes.indexOf(minEndTime) + 1;
            
            let serviceStartTime1_current = 0;
            let serviceStartTime2_current = 0;
            let serviceStartTime3_current = 0;
            let serviceTime1_current = 0;
            let serviceTime2_current = 0;
            let serviceTime3_current = 0;
            let serviceEndTime1_current = serviceEndTime1;
            let serviceEndTime2_current = serviceEndTime2;
            let serviceEndTime3_current = serviceEndTime3;
            let waitTime1_current = 0;
            let waitTime2_current = 0;
            let waitTime3_current = 0;
            let idleTime1_current = 0;
            let idleTime2_current = 0;
            let idleTime3_current = 0;
            
            if (serverToUse === 1) {
                serviceStartTime1_current = Math.max(arrivalTime, serviceEndTime1);
                waitTime1_current = Math.max(0, serviceStartTime1_current - arrivalTime);
                
                const randService = Math.random();
                serviceTime1_current = Math.max(0, -Math.log(1 - randService) / serviceRate * 60);
                serviceEndTime1_current = serviceStartTime1_current + serviceTime1_current;
                idleTime1_current = Math.max(0, serviceStartTime1_current - serviceEndTime1);
                
                serviceEndTime1 = serviceEndTime1_current;
            } else if (serverToUse === 2) {
                serviceStartTime2_current = Math.max(arrivalTime, serviceEndTime2);
                waitTime2_current = Math.max(0, serviceStartTime2_current - arrivalTime);
                
                const randService = Math.random();
                serviceTime2_current = Math.max(0, -Math.log(1 - randService) / serviceRate * 60);
                serviceEndTime2_current = serviceStartTime2_current + serviceTime2_current;
                idleTime2_current = Math.max(0, serviceStartTime2_current - serviceEndTime2);
                
                serviceEndTime2 = serviceEndTime2_current;
            } else {
                serviceStartTime3_current = Math.max(arrivalTime, serviceEndTime3);
                waitTime3_current = Math.max(0, serviceStartTime3_current - arrivalTime);
                
                const randService = Math.random();
                serviceTime3_current = Math.max(0, -Math.log(1 - randService) / serviceRate * 60);
                serviceEndTime3_current = serviceStartTime3_current + serviceTime3_current;
                idleTime3_current = Math.max(0, serviceStartTime3_current - serviceEndTime3);
                
                serviceEndTime3 = serviceEndTime3_current;
            }
            
            const systemTime = waitTime1_current + serviceTime1_current + 
                             waitTime2_current + serviceTime2_current + 
                             waitTime3_current + serviceTime3_current;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td class="formula-cell">${randArrival.toFixed(4)}</td>
                <td class="time-cell">${interarrivalTime.toFixed(2)}</td>
                <td class="time-cell">${arrivalTime.toFixed(2)}</td>
                <td class="time-cell">${serviceStartTime1_current.toFixed(2)}</td>
                <td class="time-cell">${serviceStartTime2_current.toFixed(2)}</td>
                <td class="time-cell">${serviceStartTime3_current.toFixed(2)}</td>
                <td class="wait-cell">${waitTime1_current.toFixed(2)}</td>
                <td class="wait-cell">${waitTime2_current.toFixed(2)}</td>
                <td class="wait-cell">${waitTime3_current.toFixed(2)}</td>
                <td class="service-cell">${serviceTime1_current.toFixed(2)}</td>
                <td class="service-cell">${serviceTime2_current.toFixed(2)}</td>
                <td class="service-cell">${serviceTime3_current.toFixed(2)}</td>
                <td class="time-cell">${serviceEndTime1_current.toFixed(2)}</td>
                <td class="time-cell">${serviceEndTime2_current.toFixed(2)}</td>
                <td class="time-cell">${serviceEndTime3_current.toFixed(2)}</td>
                <td class="system-cell">${systemTime.toFixed(2)}</td>
                <td class="idle-cell">${idleTime1_current.toFixed(2)}</td>
                <td class="idle-cell">${idleTime2_current.toFixed(2)}</td>
                <td class="idle-cell">${idleTime3_current.toFixed(2)}</td>
            `;
            
            table.appendChild(row);
        }
        
        // Generar estadísticas
        generateStats(arrivalRate, serviceRate, iterations, 3);
    }
    
    function generateStats(arrivalRate, serviceRate, iterations, servers) {
        const statsContainer = document.getElementById('stats-container');
        statsContainer.innerHTML = '';
        
        // Calcular estadísticas básicas
        const utilization = Math.max(0, Math.min(100, (arrivalRate / (serviceRate * servers)) * 100));
        const avgWaitTime = Math.max(0, arrivalRate / (serviceRate * (serviceRate * servers - arrivalRate)) * 60);
        const avgSystemTime = Math.max(0, 1 / (serviceRate * servers - arrivalRate) * 60);
        const avgQueueLength = Math.max(0, (arrivalRate * arrivalRate) / (serviceRate * (serviceRate * servers - arrivalRate)));
        
        const stats = [
            { title: 'Tasa de Llegada', value: `${arrivalRate} pacientes/hora` },
            { title: 'Tasa de Servicio', value: `${serviceRate} pacientes/hora` },
            { title: 'Número de Servidores', value: servers },
            { title: 'Utilización del Sistema', value: `${utilization.toFixed(2)}%` },
            { title: 'Tiempo Promedio de Espera', value: `${avgWaitTime.toFixed(2)} min` },
            { title: 'Tiempo Promedio en el Sistema', value: `${avgSystemTime.toFixed(2)} min` },
            { title: 'Longitud Promedio de la Cola', value: `${avgQueueLength.toFixed(2)} pacientes` }
        ];
        
        stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <h3>${stat.title}</h3>
                <div class="stat-value">${stat.value}</div>
            `;
            statsContainer.appendChild(statCard);
        });
    }
});