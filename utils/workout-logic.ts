import { Profile } from '@/types';

interface WorkoutDay {
  main: string;
  desc: string;
  exercises: string[];
}

export const getWorkoutSplit = (gender: 'm' | 'f', focuses: string[], workoutProtocol: string): WorkoutDay[] => {
  // Base split logic
  let split: WorkoutDay[] = [];

  const isLowerFocus = gender === 'f' || focuses?.includes('inf');
  const isUpperFocus = focuses?.includes('sup');
  const isFutFocus = focuses?.includes('fut');
  const isCorFocus = focuses?.includes('cor');
  const isHiit = workoutProtocol === 'tabata';
  const isVolume = workoutProtocol === 'resistance';

  // Common exercises
  const warmUp = "Aquecimento Geral (5-10min)";
  const mobility = "Mobilidade Articular";

  if (isFutFocus) {
    split = [
      { 
        main: "Força Explosiva (Pernas)", 
        desc: "Potência para arranques e saltos", 
        exercises: ["Agachamento com Salto", "Afundo Búlgaro", "Levantamento Terra Hex Bar", "Box Jump (Salto na Caixa)", "Panturrilha Unilateral"] 
      },
      { 
        main: "Core Rotacional e Estabilidade", 
        desc: "Prevenção de lesões e mudanças de direção", 
        exercises: ["Prancha com Rotação", "Woodchopper no Cabo", "Ponte Unilateral", "Abdominal Canivete", "Prancha Lateral"] 
      },
      { 
        main: "Superiores (Força de Contato)", 
        desc: "Proteção de bola e disputas", 
        exercises: ["Supino Reto Halteres", "Remada Curvada", "Desenvolvimento Halteres", "Barra Fixa", "Flexão de Braço"] 
      },
      { 
        main: "Agilidade e Pliometria", 
        desc: "Reatividade e velocidade de pés", 
        exercises: ["Skater Jumps", "Drills de Escada de Agilidade", "Sprints Curtos (10m)", "Saltos Laterais", "Burpees"] 
      },
      { 
        main: "Força Unilateral (Pernas)", 
        desc: "Equilíbrio e correção de assimetrias", 
        exercises: ["Agachamento Pistola (Adaptado)", "Stiff Unilateral", "Passada com Carga", "Elevação Pélvica Unilateral", "Cadeira Flexora Unilateral"] 
      },
      { 
        main: "Recuperação Ativa e Mobilidade", 
        desc: "Regeneração muscular", 
        exercises: ["Liberação Miofascial", "Alongamento Dinâmico", "Mobilidade de Quadril", "Mobilidade de Tornozelo", "Yoga/Pilates Básico"] 
      },
    ];
  } else if (isCorFocus) {
    split = [
      { 
        main: "Força Específica (Pernas)", 
        desc: "Resistência muscular e prevenção", 
        exercises: ["Agachamento Livre", "Stiff", "Afundo", "Elevação de Panturrilha em Pé", "Elevação de Panturrilha Sentado"] 
      },
      { 
        main: "Core Estabilizador", 
        desc: "Postura e eficiência na corrida", 
        exercises: ["Prancha Isométrica", "Dead Bug", "Bird Dog", "Ponte Glútea", "Prancha Lateral"] 
      },
      { 
        main: "Superiores (Postura)", 
        desc: "Balanço de braços e respiração", 
        exercises: ["Remada Baixa", "Puxada Alta", "Crucifixo Inverso", "Flexão de Braço", "Desenvolvimento Leve"] 
      },
      { 
        main: "Força Unilateral e Pliometria", 
        desc: "Potência a cada passada", 
        exercises: ["Afundo Búlgaro", "Stiff Unilateral", "Saltos Unilaterais (Pliometria Leve)", "Step Up (Subida na Caixa)", "Elevação Pélvica Unilateral"] 
      },
      { 
        main: "Resistência de Core e Quadril", 
        desc: "Estabilidade pélvica", 
        exercises: ["Cadeira Abdutora", "Cadeira Adutora", "Abdominal Bicicleta", "Elevação de Pernas", "Prancha com Toque no Ombro"] 
      },
      { 
        main: "Mobilidade e Liberação", 
        desc: "Recuperação de tecidos", 
        exercises: ["Liberação com Rolo (Banda Iliotibial, Panturrilhas)", "Alongamento de Isquiotibiais", "Mobilidade de Tornozelo", "Alongamento de Quadríceps", "Mobilidade Torácica"] 
      },
    ];
  } else if (isLowerFocus) {
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
  if (focuses?.includes('abd')) {
    split[1].desc += " + Core";
    split[1].exercises.push("Abdominal Supra", "Prancha Lateral");
    split[4].desc += " + Abdômen";
    split[4].exercises.push("Abdominal Infra", "Vacuum");
  }

  if (focuses?.includes('mob')) {
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
  profile: Profile
): { title: string; desc: string } => {
  const { focuses, runDays, runDistances, runningDifficulty, targetDistance, duration } = profile;

  if (dayWeek === 0) {
    return { 
      title: "🧘 OFF: Descanso Tático", 
      desc: "Recuperação total dos tecidos. Foco em sono, hidratação e mobilidade leve." 
    };
  }

  const hasMission = ['21', '42', '51', '100', 'custom'].includes(runningDifficulty);

  // If user has "velocidade" focus or a specific mission, we use a specific cycle
  if ((runningDifficulty !== 'none' || hasMission) && (focuses?.includes('vel') || focuses?.includes('cor'))) {
    const cycleDay = dayNum % 6; // Cycle through 6 types of workouts
    const isCor = focuses?.includes('cor') || hasMission;
    switch (cycleDay) {
      case 1:
        return {
          title: isCor ? "⚡ Intervalado Longo (800m)" : "⚡ Intervalado de Elite (400m)",
          desc: isCor ? "Aquecimento 2km + 6x800m no ritmo de prova (10km) com 2min de descanso. Finalize com 1km trote leve." : "Aquecimento 1.5km + 10x400m no ritmo de prova (5km) com 90s de descanso. Finalize com 1km trote leve."
        };
      case 2:
        return {
          title: "🏃 Tempo Run (Limiar)",
          desc: isCor ? "Aquecimento 2km + 6km em ritmo 'confortavelmente difícil' (ritmo de meia maratona)." : "Aquecimento 1km + 4km em ritmo 'confortavelmente difícil' (ritmo de 10km). Foco em manter a cadência alta."
        };
      case 3:
        return {
          title: "🎢 Fartlek Dinâmico",
          desc: isCor ? "35min de corrida variada: 3min forte / 2min leve. Ensina o corpo a limpar o lactato." : "25min de corrida variada: 2min forte / 1min leve. Melhora a capacidade de recuperação em movimento."
        };
      case 4:
        return {
          title: "⛰️ Sprints em Subida",
          desc: "Aquecimento 2km + 8 tiros de 30s em subida íngreme. Retorno caminhando. Desenvolve potência muscular."
        };
      case 5:
        return {
          title: "🔋 Rodagem de Base (Longão)",
          desc: isCor ? "10km a 15km em ritmo leve (Zona 2). Construção da base aeróbica e resistência mental." : "7km a 8km em ritmo leve (Zona 2). O objetivo é construir resistência aeróbica e fortalecer tendões."
        };
      default:
        return {
          title: "🔄 Recuperação Ativa",
          desc: "3km de trote regenerativo (ritmo muito lento) + 15min de alongamento estático."
        };
    }
  }

  if (runningDifficulty !== 'none' && focuses?.includes('fut')) {
    const cycleDay = dayNum % 3;
    switch (cycleDay) {
      case 1:
        return {
          title: "⚽ Sprints Repetidos (RSA)",
          desc: "Aquecimento + 10 tiros de 20m com mudança de direção. Descanso de 30s entre tiros. Simula o esforço do jogo."
        };
      case 2:
        return {
          title: "🏃 Resistência Intermitente",
          desc: "15s correndo forte / 15s caminhando por 10 minutos. Repetir 2 blocos com 3min de descanso entre eles."
        };
      default:
        return {
          title: "🔋 Trote de Recuperação",
          desc: "20 minutos de corrida muito leve para soltar a musculatura + alongamentos."
        };
    }
  }

  // Default Cardio for other focuses
  if (runningDifficulty !== 'none' && (runDays?.includes(dayWeek) || hasMission)) {
    let dist = runDistances?.[dayWeek] || '5';
    if (hasMission && !runDistances[dayWeek]) {
      // Suggest a distance to chip away at the mission
      const total = parseFloat(targetDistance || '0');
      const dur = parseInt(duration || '30');
      const suggested = Math.ceil(total / (dur / 2)); // Assume running half the days
      dist = suggested > 0 ? suggested.toString() : '5';
    }
    return { 
      title: `🏃 Corrida de Missão (${dist}km)`, 
      desc: `Foco em acumular quilometragem para sua meta total. Mantenha um ritmo constante.` 
    };
  }

  if (dayNum % 2 === 0) {
    return { 
      title: "🔥 HIIT Metabólico (Corrida)", 
      desc: "10 tiros de 1min em intensidade máxima (Zona 4) por 1min de descanso ativo (caminhada)." 
    };
  }

  return { 
    title: "🏃 Cardio Leve (Trote/Caminhada)", 
    desc: "30 a 40 minutos em ritmo moderado (Zona 2). Foco em recuperação ativa e queima de gordura." 
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
