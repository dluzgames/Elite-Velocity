import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Profile } from '@/types';
import { getWorkoutSplit, getCardioDetail } from './workout-logic';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generateOnboardingPDF = (profile: Profile) => {
  const doc = new jsPDF();
  
  // Set black background
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Title
  doc.setTextColor(0, 255, 128); // Neon Green
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("ELITE VELOCITY // CONTRATO DE MISSÃO", 20, 20);
  
  // Content
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let y = 40;
  const addLine = (text: string) => {
    doc.text(text, 20, y);
    y += 10;
  };

  addLine(`Agente: ${profile.studentName}`);
  addLine(`Duração da Missão: ${profile.duration} dias`);
  addLine(`Data de Início: ${format(new Date(profile.startDate), 'dd/MM/yyyy')}`);
  addLine(`Meta de Peso: -${profile.targetLostWeight}kg`);
  y += 10;
  
  doc.setTextColor(0, 255, 128);
  addLine("DIRETRIZES TÁTICAS:");
  doc.setTextColor(255, 255, 255);
  addLine(`- Protocolo de Jejum: ${profile.protocol}`);
  addLine(`- Janela Alimentar Início: ${profile.startHour}`);
  addLine(`- Focos: ${profile.focuses.join(', ')}`);
  
  y = 250;
  doc.setTextColor(255, 78, 0); // Neon Orange
  doc.setFont('helvetica', 'italic');
  doc.text("Pactuado e Irrevogável. Apenas o progresso importa.", 105, y, { align: 'center' });
  
  doc.save(`Contrato_${profile.studentName}.pdf`);
};

export const generateExcel = (profile: Profile) => {
  const data = [];
  const duration = parseInt(profile.duration);
  const startDate = new Date(profile.startDate);
  const split = getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol);

  for (let i = 1; i <= duration; i++) {
    const currentDate = addDays(startDate, i - 1);
    const dayOfWeek = currentDate.getDay();
    
    let workoutName = "Descanso / Recuperação";
    if (dayOfWeek !== 0) {
      const splitIndex = dayOfWeek - 1;
      if (split[splitIndex]) {
        workoutName = split[splitIndex].main;
      }
    }

    const cardio = getCardioDetail(
      dayOfWeek,
      i,
      profile.focuses,
      profile.footballDays,
      profile.runDays,
      profile.runDistances
    );

    const log = profile.dailyLogs[i];

    data.push({
      'Dia': i,
      'Data': format(currentDate, 'dd/MM/yyyy'),
      'Dia da Semana': format(currentDate, 'EEEE', { locale: ptBR }),
      'Dieta': profile.fastingDays.includes(dayOfWeek) ? `Jejum ${profile.protocol}` : 'Dieta Padrão',
      'Treino Musculação': workoutName,
      'Corrida/Campo': cardio,
      'Concluído': log?.completed ? 'SIM' : 'NÃO',
      'Peso (kg)': log?.weight || '',
      'Vel. Máx (km/h)': log?.maxSpeed || ''
    });
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Elite");
  XLSX.writeFile(wb, `Planilha_Mestra_${profile.studentName}.xlsx`);
};
