import { Profile } from '@/types';

interface WorkoutDay {
  main: string;
  desc: string;
  exercises: string[];
}

export const getWorkoutSplit = (gender: 'm' | 'f', focuses: string[], workoutProtocol: string): WorkoutDay[] => {
  // Base split logic
  let split: WorkoutDay[] = [];

  const isLowerFocus = gender === 'f' || focuses.includes('inf');
  const isUpperFocus = focuses.includes('sup');
  const isHiit = workoutProtocol === 'tabata';
  const isVolume = workoutProtocol === 'resistance';

  // Common exercises
  const warmUp = "Aquecimento Geral (5-10min)";
  const mobility = "Mobilidade Articular";

  if (isLowerFocus) {
    split = [
      { 
        main: "Inferiores (Quadríceps)", 
        desc: "Foco em volume e resistência", 
        exercises: ["Agachamento Livre", "Leg Press 45", "Cadeira Extensora", "Afundo com Halteres", "Panturrilha no Leg"] 
      },
      { 
        main: "Superiores Completo", 
        desc: "Manutenção de força", 
        exercises: ["Supino Reto/Inclinado", "Puxada Alta", "Desenvolvimento Ombros", "Tríceps Corda", "Rosca Direta"] 
      },
      { 
        main: "Glúteos e Posterior", 
        desc: "Cadeia posterior", 
        exercises: ["Elevação Pélvica", "Stiff", "Mesa Flexora", "Cadeira Abdutora", "Glúteo Caneleira"] 
      },
      { 
        main: "Cardio + Core", 
        desc: "Recuperação ativa e abdômen", 
        exercises: ["Prancha Isométrica", "Abdominal Supra", "Abdominal Infra", "Cardio Moderado (30min)"] 
      },
      { 
        main: "Inferiores Completo", 
        desc: "Treino metabólico de pernas", 
        exercises: ["Agachamento Sumô", "Passada", "Extensora Unilateral", "Flexora em Pé", "Panturrilha Sentado"] 
      },
      { 
        main: "Full Body / Funcional", 
        desc: "Gasto calórico total", 
        exercises: ["Burpees", "Kettlebell Swing", "Flexão de Braço", "Agachamento com Salto", "Mountain Climbers"] 
      },
    ];
  } else if (isUpperFocus) {
    split = [
      { 
        main: "Peito e Tríceps", 
        desc: "Empurrar (Push)", 
        exercises: ["Supino Reto", "Supino Inclinado Halteres", "Crucifixo", "Tríceps Testa", "Tríceps Pulley"] 
      },
      { 
        main: "Costas e Bíceps", 
        desc: "Puxar (Pull)", 
        exercises: ["Barra Fixa/Graviton", "Remada Curvada", "Puxada Frente", "Rosca Direta", "Rosca Martelo"] 
      },
      { 
        main: "Pernas Completo", 
        desc: "Base de força", 
        exercises: ["Agachamento Livre", "Leg Press", "Extensora", "Flexora", "Panturrilha"] 
      },
      { 
        main: "Ombros e Trapézio", 
        desc: "Deltóides completos", 
        exercises: ["Desenvolvimento Militar", "Elevação Lateral", "Elevação Frontal", "Crucifixo Inverso", "Encolhimento"] 
      },
      { 
        main: "Braços (Bíceps/Tríceps)", 
        desc: "Foco em braços", 
        exercises: ["Rosca Scott", "Tríceps Francês", "Rosca Concentrada", "Tríceps Banco", "Rosca Inversa"] 
      },
      { 
        main: "Peito e Costas (Upper)", 
        desc: "Volume alto superiores", 
        exercises: ["Supino Reto", "Remada Baixa", "Flexão", "Puxada Triângulo", "Face Pull"] 
      },
    ];
  } else {
    // Balanced Split
    split = [
      { main: "Peito e Tríceps", desc: "Push A", exercises: ["Supino Reto", "Crucifixo", "Tríceps Corda"] },
      { main: "Costas e Bíceps", desc: "Pull A", exercises: ["Puxada Alta", "Remada Baixa", "Rosca Direta"] },
      { main: "Pernas Completo", desc: "Legs A", exercises: ["Agachamento", "Leg Press", "Extensora"] },
      { main: "Ombros e Abdômen", desc: "Push B", exercises: ["Desenvolvimento", "Elevação Lateral", "Prancha"] },
      { main: "Upper Body", desc: "Upper Mix", exercises: ["Flexão", "Barra Fixa", "Dips"] },
      { main: "Lower Body", desc: "Legs B", exercises: ["Stiff", "Afundo", "Flexora"] },
    ];
  }

  // Modifiers
  if (focuses.includes('abd')) {
    split[1].desc += " + Core";
    split[1].exercises.push("Abdominal Supra", "Prancha Lateral");
    split[4].desc += " + Abdômen";
    split[4].exercises.push("Abdominal Infra", "Vacuum");
  }

  if (focuses.includes('mob')) {
    split[0].desc += " + Mobilidade";
    split[0].exercises.unshift("Mobilidade de Ombros");
    split[2].desc += " + Mobilidade";
    split[2].exercises.unshift("Mobilidade de Quadril");
  }

  // Add Rest Day (Sunday/Day 7 logic handled by index mapping usually, but let's ensure 7 days structure if needed, 
  // though the prompt says "Array com 6 treinos (segunda a sábado)". 
  // We will handle Sunday separately in the UI or logic.
  
  return split;
};

export const getCardioDetail = (
  dayWeek: number, // 0-6 (0 is Sunday)
  dayNum: number,
  focuses: string[],
  footballDays: number[],
  runDays: number[],
  runDistances: Record<number, string>
): { title: string; desc: string } => {
  if (dayWeek === 0) {
    return { 
      title: "🧘 OFF: Descanso Tático", 
      desc: "Recuperação total dos tecidos. Foco em sono, hidratação e mobilidade leve." 
    };
  }

  if (footballDays.includes(dayWeek)) {
    return { 
      title: "⚽ Treino Coletivo / Futebol", 
      desc: "Aquecimento funcional (15min) + Jogo. Foco em agilidade e explosão lateral." 
    };
  }

  // If user has "velocidade" focus, we use a specific 5km speed cycle
  if (focuses.includes('vel')) {
    const cycleDay = dayNum % 6; // Cycle through 6 types of workouts
    switch (cycleDay) {
      case 1:
        return {
          title: "⚡ Intervalado de Elite (400m)",
          desc: "Aquecimento 1.5km + 10x400m no ritmo de prova (5km) com 90s de descanso. Finalize com 1km trote leve."
        };
      case 2:
        return {
          title: "🏃 Tempo Run (Limiar)",
          desc: "Aquecimento 1km + 4km em ritmo 'confortavelmente difícil' (ritmo de 10km). Foco em manter a cadência alta."
        };
      case 3:
        return {
          title: "🎢 Fartlek Dinâmico",
          desc: "25min de corrida variada: 2min forte / 1min leve. Melhora a capacidade de recuperação em movimento."
        };
      case 4:
        return {
          title: "⛰️ Sprints em Subida",
          desc: "Aquecimento 2km + 8 tiros de 30s em subida íngreme. Retorno caminhando. Desenvolve potência muscular."
        };
      case 5:
        return {
          title: "🔋 Rodagem de Base (Longão)",
          desc: "7km a 8km em ritmo leve (Zona 2). O objetivo é construir resistência aeróbica e fortalecer tendões."
        };
      default:
        return {
          title: "🔄 Recuperação Ativa",
          desc: "3km de trote regenerativo (ritmo muito lento) + 15min de alongamento estático."
        };
    }
  }

  // Default Cardio for other focuses
  if (runDays.includes(dayWeek) || dayNum % 2 === 0) {
    const dist = runDistances[dayWeek] || '5';
    return { 
      title: `🏃 Corrida de Manutenção (${dist}km)`, 
      desc: `Manter ritmo constante e controlado. Foco na respiração nasal e postura ereta.` 
    };
  }

  return { 
    title: "🔥 HIIT Metabólico", 
    desc: "10 tiros de 1min em intensidade máxima (Zona 4) por 1min de descanso ativo (caminhada)." 
  };
};

export const getTrainingExamples = (dayNum: number, profile: Profile): string[] => {
  // dayNum is 1-based index of the mission
  // We need to map it to the weekly split (0-5 for Mon-Sat, Sunday special)
  
  const date = new Date(profile.startDate);
  date.setDate(date.getDate() + (dayNum - 1));
  const dayOfWeek = date.getDay(); // 0 = Sun

  if (dayOfWeek === 0) {
    return ["Alongamento Completo", "Mobilidade de Quadril", "Mobilidade de Tornozelo", "Caminhada Leve (Opcional)"];
  }

  // Map Mon(1) -> 0, Sat(6) -> 5
  const splitIndex = dayOfWeek - 1;
  const split = getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol);
  
  if (split[splitIndex]) {
    return split[splitIndex].exercises;
  }
  
  return ["Treino Livre"];
};

export const getFullWorkoutHistory = (profile: Profile): { day: number; title: string; exercises: string[]; completed: boolean }[] => {
  const history = [];
  const duration = parseInt(profile.duration);

  for (let i = 1; i <= duration; i++) {
    const date = new Date(profile.startDate);
    date.setDate(date.getDate() + (i - 1));
    const dayOfWeek = date.getDay(); // 0 = Sun

    let title = "Treino Livre";
    let exercises: string[] = [];

    if (dayOfWeek === 0) {
      title = "Repouso Tático";
      exercises = ["Mobilidade e Recuperação"];
    } else {
      const splitIndex = dayOfWeek - 1;
      const split = getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol);
      if (split[splitIndex]) {
        title = split[splitIndex].main;
        exercises = split[splitIndex].exercises;
      }
    }

    const log = profile.dailyLogs[i];
    const completed = log?.workoutCompleted || false;

    history.push({
      day: i,
      title,
      exercises,
      completed
    });
  }

  return history;
};
