function combinationDataHour(data: any[], combineHours: number) {
  const combinedData: any = [];

  // Agrupar los datos por día
  const groupedByDay = data.reduce((acc, item) => {
    const day = item.shortDate;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {});

  // Combinar los datos por día y por intervalos de horas
  for (const day in groupedByDay) {
    const dayData = groupedByDay[day];
    const groupedByInterval: Record<number, any[]> = {};

    // Agrupar por intervalos 
    dayData.forEach((item: { hour: string }) => {
      const hour = parseInt(item.hour.split(":")[0], 10);
      const interval = Math.floor(hour / combineHours);
      if (!groupedByInterval[interval]) {
        groupedByInterval[interval] = [];
      }
      groupedByInterval[interval].push(item);
    });

    // Combinar los datos de cada intervalo
    for (const interval in groupedByInterval) {
      const chunk = groupedByInterval[interval];
      const combinedChunk: any = combineChunkData(chunk);
      combinedData.push(combinedChunk);
    }
  }
  return combinedData;
}

function combineChunkData(chunk: any[]) {
  const combined = { ...chunk[chunk.length - 1] }; // tomar la última hora del bloque
  const properties = ["m", "b", "h", "t", "l", "u"];
  const sum: { [key: string]: number } = {};

  // Inicializar sumas
  properties.forEach((prop) => {
    sum[prop] = 0;
  });

  // Sumar valores
  chunk.forEach((item) => {
    properties.forEach((prop) => {
      if (item[prop] !== undefined) {
        sum[prop] += parseFloat(item[prop]);
      }
    });
  });

  // Calcular porcentajes
  properties.forEach((prop) => {
    combined[prop] = (sum[prop] / chunk.length).toFixed(2);
  });

  // Asignar la última hora encontrada
  combined.hour = chunk[chunk.length - 1].hour;

  return combined;
}

export { combinationDataHour };