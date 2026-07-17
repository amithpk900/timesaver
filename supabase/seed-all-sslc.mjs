import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkwwpuyvzmqqrqejkuvg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrd3dwdXl2em1xcXJxZWprdXZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYyOTY5OSwiZXhwIjoyMDk5MjA1Njk5fQ.UODQ5RA6Q8FvZzmK9dgK-zAEm9pyyjNO40_K4lHZgAQ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const GRADE_ID = '00000000-0000-0001-0000-000000000001'; // SSLC (10th)

const subjectsData = [
  {
    name: "Mathematics",
    chapters: [
      { chapter_number: 1, title: "Arithmetic Progressions", topics: ["Introduction to AP", "General form of AP", "nth term of AP", "Sum of first n terms of AP", "Practical problems based on AP"] },
      { chapter_number: 2, title: "Triangles", topics: ["Similarity of triangles", "Basic Proportionality Theorem (Thales Theorem)", "Criteria for similarity of triangles", "Pythagoras Theorem and proof"] },
      { chapter_number: 3, title: "Pair of Linear Equations in Two Variables", topics: ["Graphical method of solution", "Substitution method", "Elimination method", "Equations reducible to linear form"] },
      { chapter_number: 4, title: "Quadratic Equations", topics: ["Standard form of quadratic equation", "Solution by factorization", "Solution by quadratic formula", "Nature of roots"] },
      { chapter_number: 5, title: "Circles", topics: ["Tangent to a circle", "Theorem: Tangent perpendicular to radius", "Theorem: Equal length of tangents from external point"] },
      { chapter_number: 6, title: "Constructions", topics: ["Division of a line segment", "Tangents to a circle from external point", "Construction of similar triangles"] },
      { chapter_number: 7, title: "Coordinate Geometry", topics: ["Distance formula", "Section formula", "Mid-point formula"] },
      { chapter_number: 8, title: "Introduction to Trigonometry", topics: ["Trigonometric ratios of acute angle", "Ratios of specific angles", "Trigonometric identities"] },
      { chapter_number: 9, title: "Some Applications of Trigonometry", topics: ["Heights and distances", "Angle of elevation", "Angle of depression"] },
      { chapter_number: 10, title: "Statistics", topics: ["Mean of grouped data", "Median of grouped data", "Mode of grouped data"] },
      { chapter_number: 11, title: "Probability", topics: ["Classical probability", "Simple events", "Sure and impossible events"] },
      { chapter_number: 12, title: "Real Numbers", topics: ["Fundamental Theorem of Arithmetic", "Revisiting irrational numbers", "Decimal expansions of rational numbers"] },
      { chapter_number: 13, title: "Polynomials", topics: ["Geometrical meaning of zeroes", "Relationship between zeroes and coefficients", "Division algorithm"] },
      { chapter_number: 14, title: "Surface Areas and Volumes", topics: ["Surface area of combination of solids", "Volume of combination of solids", "Conversion of solid shapes"] },
      { chapter_number: 15, title: "Areas Related to Circles", topics: ["Perimeter and area of circle", "Areas of sector and segment"] }
    ]
  },
  {
    name: "Chemistry",
    chapters: [
      { chapter_number: 1, title: "Chemical Reactions and Equations", topics: ["Chemical equations writing and balancing", "Types of chemical reactions", "Redox reactions", "Corrosion and Rancidity"] },
      { chapter_number: 2, title: "Acids, Bases, and Salts", topics: ["Chemical properties of acids and bases", "pH scale and its importance", "Common salt chemicals (Sodium Hydroxide, Bleaching Powder, Baking Soda, Washing Soda, Plaster of Paris)"] },
      { chapter_number: 3, title: "Metals and Non-metals", topics: ["Physical/Chemical properties of metals/non-metals", "Reactivity series", "Ionic compounds properties", "Metallurgy and corrosion prevention"] },
      { chapter_number: 4, title: "Carbon and its Compounds", topics: ["Covalent bonding in carbon", "Versatile nature of carbon", "Homologous series", "Ethanol and Ethanoic acid", "Soaps and detergents"] }
    ]
  },
  {
    name: "Biology",
    chapters: [
      { chapter_number: 1, title: "Life Processes", topics: ["Nutrition in autotrophs and heterotrophs", "Respiration", "Transportation in human beings and plants", "Excretion in human beings and plants"] },
      { chapter_number: 2, title: "Control and Coordination", topics: ["Nervous system", "Reflex action", "Human brain structure", "Plant hormones and movements", "Endocrine glands and hormones"] },
      { chapter_number: 3, title: "How do Organisms Reproduce?", topics: ["Asexual reproduction modes", "Sexual reproduction in flowering plants", "Male/Female reproductive systems", "Reproductive health"] },
      { chapter_number: 4, title: "Heredity", topics: ["Accumulation of variation", "Mendel's laws of inheritance", "Sex determination"] },
      { chapter_number: 5, title: "Our Environment", topics: ["Ecosystem and food chains", "Ozone layer depletion", "Waste management"] }
    ]
  },
  {
    name: "Physics",
    chapters: [
      { chapter_number: 1, title: "Human Eye and Colourful World", topics: ["Power of accommodation of eye", "Defects of vision and correction", "Refraction through a prism", "Dispersion of light", "Scattering of light"] },
      { chapter_number: 2, title: "Electricity", topics: ["Ohm's law", "Factors on which resistance depends", "Series and Parallel resistor systems", "Joule's law of heating", "Electric power"] },
      { chapter_number: 3, title: "Magnetic Effects of Electric Current", topics: ["Magnetic field lines", "Force on current-carrying conductor", "Fleming's Left/Right Hand Rules", "Electromagnetic induction", "Domestic electric circuits"] }
    ]
  },
  {
    name: "Social Science",
    chapters: [
      { chapter_number: 1, title: "Advent of Europeans to India", topics: ["Fall of Constantinople", "Carnatic Wars", "Battle of Plassey and Buxar", "Dual Government"] },
      { chapter_number: 2, title: "The Extension of British Rule", topics: ["Anglo-Maratha Wars", "Anglo-Sikh Wars", "Subsidiary Alliance", "Doctrine of Lapse"] },
      { chapter_number: 3, title: "The Impact of British Rule in India", topics: ["Administrative and judicial systems", "Land revenue systems", "Impact of modern education"] },
      { chapter_number: 4, title: "Opposition to British Rule in Karnataka", topics: ["Hyder Ali and Tippu Sultan", "Dondiya Wagh", "Kittur Chennamma", "Sangolli Rayanna"] },
      { chapter_number: 5, title: "Social and Religious Reformation Movements", topics: ["Brahmo Samaj", "Arya Samaj", "Prarthana Samaj", "Satyashodhak Samaj", "Ramakrishna Mission"] },
      { chapter_number: 6, title: "The First War of Indian Independence (1857)", topics: ["Causes of revolt", "Spread and leaders of revolt", "Failure and results of revolt"] },
      { chapter_number: 7, title: "Freedom Movement", topics: ["Rise of nationalism", "Indian National Congress foundation", "Moderates and Radicals", "Role of Revolutionaries"] },
      { chapter_number: 8, title: "Era of Gandhi and National Movement", topics: ["Non-Cooperation Movement", "Civil Disobedience Movement", "Quit India Movement", "Dr. B. R. Ambedkar's role", "Partition of India"] },
      { chapter_number: 9, title: "Post Independent India", topics: ["Refugee rehabilitation", "Integration of princely states", "Linguistic reorganization of states"] },
      { chapter_number: 10, title: "Problems of India and their Solutions", topics: ["Unemployment", "Corruption", "Gender/Caste discrimination", "Communalism", "Terrorism"] },
      { chapter_number: 11, title: "Indian Foreign Policy", topics: ["Panchsheel principles", "Non-Alignment policy", "Stance on colonialism and apartheid"] },
      { chapter_number: 12, title: "India's Relationship with Other Countries", topics: ["Relations with China", "Relations with Pakistan", "Relations with USA and Russia"] },
      { chapter_number: 13, title: "Global Problems and India's Role", topics: ["Human rights", "Arms race", "Economic inequality", "Environmental issues"] },
      { chapter_number: 14, title: "International Institutions", topics: ["UNO organs and specialized agencies", "Regional cooperations (SAARC, EU, ASEAN)"] },
      { chapter_number: 15, title: "Social Stratification", topics: ["Caste system and untouchability", "Constitutional measures for eradication"] },
      { chapter_number: 16, title: "Labour", topics: ["Division of labor", "Organized vs unorganized sectors", "Social security measures"] },
      { chapter_number: 17, title: "Social Movements", topics: ["Environmental movements", "Peasant and women movements", "Anti-caste movements"] },
      { chapter_number: 18, title: "Social Problems", topics: ["Child labor", "Child marriage", "Female foeticide"] },
      { chapter_number: 19, title: "India - Position and Extension", topics: ["Geographical location", "Frontiers and coastline", "Neighboring countries"] },
      { chapter_number: 20, title: "India - Physiographic Divisions", topics: ["Northern Mountains", "Northern Plains", "Peninsular Plateau", "Coastal Plains and Islands"] },
      { chapter_number: 21, title: "India - Climate", topics: ["Climatic factors", "Seasons of India", "Rainfall distribution"] },
      { chapter_number: 22, title: "India - Soils", topics: ["Types of soils", "Distribution and features", "Soil conservation"] },
      { chapter_number: 23, title: "India - Forest Resources", topics: ["Forest types", "Conservation of forests", "National parks and reserves"] },
      { chapter_number: 24, title: "India - Water Resources", topics: ["River systems", "Irrigation types", "Multipurpose projects"] },
      { chapter_number: 25, title: "India - Land Resources", topics: ["Land utilization", "Types of farming", "Major food and commercial crops"] },
      { chapter_number: 26, title: "India - Mineral and Power Resources", topics: ["Metallic and non-metallic minerals", "Conventional/Non-conventional power"] },
      { chapter_number: 27, title: "India - Transport and Communication", topics: ["Roadways, railways, airways, ports", "Mass communication and space tech"] },
      { chapter_number: 28, title: "India - Industries", topics: ["Iron and steel", "Cotton textiles", "IT industries", "Industrial regions"] },
      { chapter_number: 29, title: "India - Natural Disasters", topics: ["Earthquakes, floods, cyclones", "Landslides and coastal erosion prevention"] },
      { chapter_number: 30, title: "India - Population", topics: ["Growth, density, distribution", "Population composition"] },
      { chapter_number: 31, title: "Development", topics: ["Economic growth vs development", "HDI and indicators", "Panchayat Raj decentralization"] },
      { chapter_number: 32, title: "Sectors of Indian Economy", topics: ["Primary, secondary, tertiary sectors", "Employment share", "Rural development and employment programs"] },
      { chapter_number: 33, title: "Money and Credit", topics: ["Evolution of money", "Banking system and RBI", "Formal/Informal credit, SHGs"] },
      { chapter_number: 34, title: "Public Finance and Budget", topics: ["Public revenue and taxes (GST)", "Public expenditure and deficit", "Budget categories"] },
      { chapter_number: 35, title: "Banking Transactions", topics: ["Functions of banks", "Types of accounts", "Account opening procedure", "Digital banking"] },
      { chapter_number: 36, title: "Entrepreneurship", topics: ["Characteristics and functions", "Supporting financial institutions", "Startups"] },
      { chapter_number: 37, title: "Consumer Education and Protection", topics: ["Forms of exploitation", "Consumer rights", "Consumer Protection Act", "Redressal machinery"] }
    ]
  },
  {
    name: "English",
    chapters: [
      { chapter_number: 1, title: "A Hero", topics: ["Swami's story by R.K. Narayan", "Physical vs moral courage", "Vocabulary and comprehension"] },
      { chapter_number: 2, title: "There's a Girl by the Tracks!", topics: ["Rescue of Roma Talreja", "Civic responsibility", "Medical urgency response"] },
      { chapter_number: 3, title: "Gentleman of Rio en Medio", topics: ["Don Anselmo's respect for trees", "Cultural differences in land sale", "Values of honor"] },
      { chapter_number: 4, title: "Dr. B. R. Ambedkar", topics: ["Educational pursuit", "Drafting of the Constitution", "Rights of depressed classes"] },
      { chapter_number: 5, title: "The Concert", topics: ["Anant's cancer battle", "Smita's dedication", "Compassion of Ravi Shankar"] },
      { chapter_number: 6, title: "The Discovery", topics: ["Columbus play by Herman Ould", "Mutiny conflict", "Leadership qualities"] },
      { chapter_number: 7, title: "Colours of Silence", topics: ["Satish Gujral's childhood deafness", "Art as self-expression", "Parental support"] },
      { chapter_number: 8, title: "Science and Hope of Survival", topics: ["Indispensability of science", "Nuclear war prevention", "Interdisciplinary research"] },
      { chapter_number: 9, title: "Grandma Climbs a Tree", topics: ["Ruskin Bond's grandma's spirit", "Love for nature", "Humorous poetry"] },
      { chapter_number: 10, title: "Quality of Mercy", topics: ["Shakespeare's speech", "Mercy as divine attribute", "Figures of speech"] },
      { chapter_number: 11, title: "I am the Land", topics: ["Personification of earth", "Human exploitation limits", "Patience of land"] },
      { chapter_number: 12, title: "The Song of India", topics: ["Gokak's dialogue with Mother India", "Glory vs social evils", "Future vision of India"] },
      { chapter_number: 13, title: "Jazz Poem Two", topics: ["Carl Wendall Hines' old musician", "Music as escape from pain", "Imagery and mood of jazz"] },
      { chapter_number: 14, title: "Ballad of the Tempest", topics: ["Ship caught in storm", "Child's restoring faith", "Narrative ballad style"] },
      { chapter_number: 15, title: "The Blind Boy", topics: ["Cibber's blind child perspective", "Inner light and optimism", "Resilience values"] },
      { chapter_number: 16, title: "Off to Outer Space Tomorrow Morning", topics: ["Space isolation", "Comparison with earth life", "Futuristic poetry"] },
      { chapter_number: 17, title: "Narayanpur Incident (Supplementary)", topics: ["Quit India Movement", "Patriotism in youth", "Resistance stories"] },
      { chapter_number: 18, title: "On Top of the World (Supplementary)", topics: ["Everest climb of Dicky Dolma", "Perseverance and grit", "Adventure sports"] }
    ]
  },
  {
    name: "Kannada",
    chapters: [
      { chapter_number: 1, title: "Shabari (Prose)", topics: ["Devotion of Shabari", "Ramayana episode", "Moral values"] },
      { chapter_number: 2, title: "Yuddha (Prose)", topics: ["Impact of war on humanity", "Message of peace", "Emotional struggles"] },
      { chapter_number: 3, title: "Sankalpa Geethe (Poem)", topics: ["Determination and optimism", "Building positive society", "Patriotic themes"] }
    ]
  },
  {
    name: "Hindi",
    chapters: [
      { chapter_number: 1, title: "Matribhoomi", topics: ["Patriotic poem dedicated to India", "Praising national heroes and natural resources"] },
      { chapter_number: 2, title: "Kashmiri Seb", topics: ["Consumer awareness story by Premchand", "Cheating in markets and awareness"] },
      { chapter_number: 3, title: "Gillu", topics: ["Mahadevi Verma's squirrel companion", "Affection for animals and nature"] },
      { chapter_number: 4, title: "Abhinav Manushya", topics: ["Ramdhari Singh Dinkar's progress poem", "Scientific advancement vs moral values"] },
      { chapter_number: 5, title: "Mera Bachpan", topics: ["Kalam's childhood memories", "Family values and Rameswaram harmony"] }
    ]
  }
];

async function main() {
  console.log('Seeding SSLC (10th) subjects, chapters and topics...');

  for (const sData of subjectsData) {
    console.log(`Processing subject: ${sData.name}...`);

    // 1. Check or insert subject
    let subjectId;
    const { data: existingSubjects, error: sErr } = await supabase
      .from('subjects')
      .select('id')
      .eq('grade_id', GRADE_ID)
      .eq('name', sData.name);

    if (sErr) {
      console.error(`Error finding subject ${sData.name}:`, sErr);
      continue;
    }

    if (existingSubjects && existingSubjects.length > 0) {
      subjectId = existingSubjects[0].id;
      console.log(`Subject ${sData.name} already exists (ID: ${subjectId})`);
    } else {
      const { data: newSub, error: insErr } = await supabase
        .from('subjects')
        .insert({
          grade_id: GRADE_ID,
          name: sData.name,
          stream_id: null
        })
        .select('id')
        .single();

      if (insErr) {
        console.error(`Error inserting subject ${sData.name}:`, insErr);
        continue;
      }
      subjectId = newSub.id;
      console.log(`Inserted new subject ${sData.name} (ID: ${subjectId})`);
    }

    // 2. Process chapters
    for (const cData of sData.chapters) {
      let chapterId;
      const { data: existingChapters, error: cErr } = await supabase
        .from('chapters')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('title', cData.title);

      if (cErr) {
        console.error(`Error finding chapter ${cData.title}:`, cErr);
        continue;
      }

      if (existingChapters && existingChapters.length > 0) {
        chapterId = existingChapters[0].id;
        console.log(`  Chapter "${cData.title}" already exists (ID: ${chapterId})`);
      } else {
        const { data: newCh, error: insChErr } = await supabase
          .from('chapters')
          .insert({
            subject_id: subjectId,
            title: cData.title,
            chapter_number: cData.chapter_number,
            sort_order: cData.chapter_number
          })
          .select('id')
          .single();

        if (insChErr) {
          console.error(`  Error inserting chapter ${cData.title}:`, insChErr);
          continue;
        }
        chapterId = newCh.id;
        console.log(`  Inserted chapter "${cData.title}" (ID: ${chapterId})`);
      }

      // 3. Process topics
      for (let i = 0; i < cData.topics.length; i++) {
        const tTitle = cData.topics[i];
        const { data: existingTopics, error: tErr } = await supabase
          .from('topics')
          .select('id')
          .eq('chapter_id', chapterId)
          .eq('title', tTitle);

        if (tErr) {
          console.error(`    Error finding topic ${tTitle}:`, tErr);
          continue;
        }

        if (existingTopics && existingTopics.length > 0) {
          console.log(`    Topic "${tTitle}" already exists`);
        } else {
          const { error: insTErr } = await supabase
            .from('topics')
            .insert({
              chapter_id: chapterId,
              title: tTitle,
              sort_order: i + 1
            });

          if (insTErr) {
            console.error(`    Error inserting topic ${tTitle}:`, insTErr);
          } else {
            console.log(`    Inserted topic "${tTitle}"`);
          }
        }
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main().catch(console.error);
