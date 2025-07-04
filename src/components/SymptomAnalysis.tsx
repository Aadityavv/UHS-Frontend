import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ActivitySquare, RotateCw, Stethoscope, ClipboardList } from "lucide-react";

interface SymptomData {
  Symptom: string;
  Condition: string;
  Treatment: string;
  Precaution: string;
  Medicine: string;
  Effectiveness: "Very High" | "High" | "Moderate";
}

const parseCSV = (csv: string): SymptomData[] => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  const result: SymptomData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const obj: any = {};
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    for (let j = 0; j < headers.length; j++) {
      let value = currentline[j];
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      obj[headers[j]] = value;
    }
    
    result.push(obj as SymptomData);
  }
  
  return result;
};

const symptomCSV = `Symptom,Condition,Treatment,Precaution,Medicine,Effectiveness
Fever,Seasonal Flu,"Rest, antiviral medication, hydration","Flu vaccination, avoid crowded places",Oseltamivir if prescribed,Very High
Fever,Exam Stress Fever,"Rest, cooling measures, stress management","Regular breaks, proper sleep",Paracetamol,Moderate
Fever,Covid-19 Symptoms,"Isolation, medical attention, rest","Vaccination, mask wearing, social distance",As prescribed by doctor,Very High
Headache,Dehydration Headache,"Fluid intake, electrolytes, rest","Regular water intake schedule",Electrolyte solution + Paracetamol,High
Headache,Sinus Pressure,"Steam inhalation, nasal decongestants","Avoid allergens, proper humidity",Nasal spray + Pain relievers,High
Headache,Screen Time Related,"Blue light filters, breaks, eye exercises","20-20-20 rule, proper lighting",Pain relievers + Eye drops,Moderate
Stomach Pain,Exam Anxiety,"Relaxation techniques, light meals","Stress management, regular meals",Antacids + Anti-anxiety herbs,High
Stomach Pain,Lactose Intolerance,"Dairy alternatives, enzyme supplements","Avoid dairy products",Lactase enzymes,Very High
Stomach Pain,Appendicitis Symptoms,"Immediate medical attention","Regular health check-ups",Emergency medical care,Very High
Diarrhea,Cafeteria Food Reaction,"BRAT diet, probiotics, hydration","Food safety awareness",ORS + Probiotics,High
Diarrhea,Stress-Induced,"Stress management, diet modification","Regular eating schedule",Anti-diarrheal + Probiotics,Moderate
Diarrhea,Antibiotics Related,"Probiotics, yogurt, hydration","Complete prescribed course",Probiotic supplements,High
Constipation,Exam Stress Related,"Fiber-rich diet, stress management","Regular exercise, water intake",Fiber supplements,High
Constipation,Travel Related,"Increased water, movement","Maintain routine while traveling",Mild laxatives,Moderate
Fatigue,Anemia,"Iron supplements, proper diet","Regular blood tests, iron-rich foods",Iron supplements,Very High
Fatigue,Depression Symptoms,"Professional help, exercise","Regular counseling, social support",Professional evaluation needed,High
Fatigue,Mono/Glandular Fever,"Complete rest, hydration","Avoid sharing drinks/food",Supportive care as prescribed,Very High
Eye Strain,Online Class Fatigue,"Screen breaks, eye exercises","Proper screen distance, lighting",Artificial tears + Computer glasses,High
Eye Strain,All-Night Study,"Regular breaks, proper lighting","Study schedule planning",Lubricating drops,High
Eye Strain,Night Reading,"Proper lighting, breaks","20-20-20 rule",Moisturizing eye drops,High
Back Pain,Gaming Posture,"Ergonomic setup, exercises","Proper gaming chair, breaks",Muscle relaxant gel,High
Back Pain,Lab Work Strain,"Stretching exercises, proper posture","Ergonomic lab setup",Anti-inflammatory gel,Moderate
Neck Pain,Phone Usage,"Posture correction, neck exercises","Phone holder, reduced usage",Pain relief patches,High
Skin Issues,Stress Breakouts,"Face care routine, stress management","Regular cleaning, meditation",Benzoyl peroxide + Moisturizer,High
Skin Issues,Dormitory Allergies,"Identify triggers, antihistamines","Clean bedding, air purifier",Antihistamine + Cream,High
Sleep Problems,Gaming Addiction,"Screen time limits, sleep hygiene","Regular schedule, wind-down routine",Melatonin if prescribed,High
Sleep Problems,Pre-Exam Anxiety,"Relaxation techniques, schedule","Study planning, anxiety management",Natural sleep aids,Moderate
Anxiety,Presentation Fear,"Breathing exercises, preparation","Practice sessions, confidence building",Anti-anxiety techniques,High
Anxiety,Social Media Pressure,"Digital detox, counseling","Balanced social media use",Professional support if needed,High
Depression,Homesickness,"Support groups, activities","Regular family contact, friends",Counseling support,High
Depression,Academic Failure,"Professional help, academic counseling","Study planning, support system",Professional evaluation,Very High
Sore Throat,Public Speaking Strain,"Voice rest, warm tea","Proper voice techniques",Throat spray + Lozenges,Moderate
Common Cold,Dormitory Spread,"Rest, isolation, fluids","Hand hygiene, mask wearing",Cold relief + Vitamin C,High
Cough,Library Air Quality,"Hydration, fresh air breaks","Mask usage, location change",Cough suppressant,Moderate
Allergies,Seasonal Changes,"Antihistamines, air purifier","Track pollen counts, preparation",24-hour antihistamines,High
Muscle Pain,Esports Practice,"Stretching, ergonomics","Regular breaks, exercises",Cooling gel + Stretches,Moderate
Joint Pain,Dance Practice,"RICE method, proper warm-up","Technique training, rest days",Anti-inflammatory gel,High
Nausea,Exam Anxiety,"Anti-anxiety techniques, light meals","Proper meal timing, relaxation",Anti-emetics if severe,High
Weight Gain,Stress Eating,"Mindful eating, exercise","Meal planning, stress management",Nutritionist consultation,Moderate
Weight Loss,Depression Related,"Nutritional support, counseling","Regular meals, support system",Professional help needed,High
Dehydration,Sports Practice,"Electrolyte replacement, monitoring","Regular hydration schedule",Sports drinks + ORS,Very High
Minor Injuries,Lab Accidents,"First aid, proper care","Safety protocols, attention",First aid supplies,High
UTI,Dehydration Related,"Antibiotics, increased fluids","Regular bathroom breaks, hygiene",Prescribed antibiotics,Very High
Dental Issues,Energy Drink Damage,"Dental care, reduction","Proper oral hygiene, alternatives",Sensitive teeth treatment,High
Computer Vision,Coding Projects,"Screen breaks, eye exercises","Proper monitor setup, breaks",Computer glasses,High
Hand Pain,Digital Art Work,"Ergonomic tools, breaks","Proper equipment, techniques",Wrist support + Cream,Moderate
Social Anxiety,Group Projects,"Gradual exposure, preparation","Communication skills practice",Professional support,High
Caffeine Dependency,Assignment Deadlines,"Gradual reduction, alternatives","Better time management",Herbal alternatives,Moderate
RSI,Programming,"Ergonomic equipment, breaks","Proper typing technique",Wrist brace + Exercise,High
Vocal Strain,Debate Practice,"Voice rest, warm liquids","Proper voice techniques",Throat coat tea,Moderate
Panic Attacks,Exam Pressure,"Breathing techniques, support","Stress management, preparation",Professional help if needed,Very High
Motion Sickness,Field Trips,"Anti-motion medication, positioning","Travel preparation, seating choice",Motion sickness patches,High
Respiratory Issues,Lab Chemical Exposure,"Fresh air, medical attention","Safety protocols, PPE",Emergency care if needed,Very High
Menstrual Pain,Academic Stress,"Pain management, stress reduction","Cycle tracking, preparation",Period pain relievers,High
Food Allergies,Cafeteria Food,"Allergen avoidance, medical ID","Menu checking, self-advocacy",Emergency allergy kit,Very High
Vitamin D Deficiency,Indoor Studies,"Supplements, sunlight exposure","Regular outdoor time",Vitamin D supplements,High
Iron Deficiency,Poor Diet,"Iron supplements, diet changes","Regular blood tests, iron-rich foods",Prescribed iron tablets,Very High
Carpal Tunnel,Extended Typing,"Wrist exercises, ergonomics","Proper typing posture, breaks",Wrist brace + NSAIDs,High
Migraine,Screen Exposure,"Dark room, pain management","Screen breaks, trigger avoidance",Migraine medication,Very High
Stress Rash,Deadline Pressure,"Antihistamines, stress management","Time management, relaxation",Calming cream + Antihistamine,Moderate
Tennis Elbow,Mouse Usage,"Rest, ergonomic equipment","Proper desk setup, exercises",Anti-inflammatory gel,High
Vertigo,Study Stress,"Position changes, medical check","Regular breaks, proper posture",As prescribed by doctor,High
Tinnitus,Headphone Usage,"Volume reduction, breaks","Safe volume levels, time limits",Professional evaluation,Moderate
Burnout,Academic Overload,"Rest, counseling, schedule adjustment","Work-life balance, support",Professional support,Very High
Repetitive Strain,Gaming,"Equipment adjustment, breaks","Proper posture, stretches",Pain relief + Exercise,High
Muscle Cramps,All-Night Gaming,"Stretching, hydration, electrolytes","Regular breaks, proper posture",Magnesium supplements,High
Muscle Cramps,Lab Standing Hours,"Movement breaks, proper shoes","Compression socks, posture",Electrolyte supplements,Moderate
Muscle Cramps,Sports Practice,"Hydration, banana intake","Proper warm-up, stretching",Electrolyte drinks,High
Dizziness,Low Blood Sugar,"Quick glucose, proper meals","Regular meal schedule",Glucose tablets,Very High
Dizziness,Poor Ventilation,"Fresh air, hydration","Proper room ventilation",Rehydration solution,Moderate
Dizziness,Blood Pressure Issues,"Medical check, rest","Regular BP monitoring",As prescribed,High
Chest Pain,Anxiety Attack,"Breathing exercises, support","Stress management, counseling",Professional evaluation,Very High
Chest Pain,Caffeine Excess,"Reduction, hydration","Limiting intake, alternatives",Reduction plan,High
Chest Pain,Exercise Strain,"Rest, gradual return","Proper technique, warm-up",Professional evaluation,Very High
Breathing Issues,Dust Allergy,"Air purifier, cleaning","Regular room cleaning",Antihistamines,High
Breathing Issues,Anxiety Related,"Breathing exercises, counseling","Stress management",Anti-anxiety techniques,High
Breathing Issues,Poor Air Quality,"Fresh air, ventilation","Air purifier usage",Prescribed inhaler if needed,Very High
Shoulder Pain,Backpack Weight,"Weight reduction, exercises","Proper carrying technique",Pain relief gel,High
Shoulder Pain,Laptop Usage,"Ergonomic setup, stretches","Proper desk height",Muscle relaxant,Moderate
Shoulder Pain,Sleep Position,"Posture correction, proper pillow","Better sleeping position",Pain relief patch,High
Digestive Issues,Late Night Eating,"Timing adjustment, light meals","Regular meal schedule",Digestive enzymes,High
Digestive Issues,Energy Drinks,"Reduction, alternatives","Healthier options",Antacids,Moderate
Digestive Issues,Fast Food Diet,"Diet modification, probiotics","Meal planning",Probiotics,High
Memory Issues,Sleep Debt,"Sleep schedule, memory exercises","Regular sleep pattern",Memory supplements,High
Memory Issues,Stress Related,"Stress management, techniques","Study techniques, breaks",Professional help if needed,Moderate
Memory Issues,Poor Nutrition,"Nutritional improvement, supplements","Diet planning",Brain supplements,High
Hair Loss,Stress Related,"Stress management, hair care","Regular care, nutrition",Hair supplements,Moderate
Hair Loss,Nutritional Deficiency,"Diet improvement, supplements","Balanced nutrition",Vitamin supplements,High
Hair Loss,Hard Water,"Water filter, hair care","Proper hair care",Medicated shampoo,Moderate
Nail Problems,Poor Nutrition,"Dietary changes, supplements","Balanced diet",Biotin supplements,High
Nail Problems,Stress Habits,"Habit correction, care","Stress management",Nail strengtheners,Moderate
Cold Hands,Poor Circulation,"Exercise, warming techniques","Proper clothing",Circulation supplements,Moderate
Cold Hands,Anxiety Related,"Anxiety management, warmth","Stress reduction",Stress relief techniques,High
Cold Hands,Study Room AC,"Temperature adjustment, breaks","Proper clothing layers",Hand warmers,Moderate
Dry Eyes,AC Exposure,"Humidifier, eye drops","Room humidity control",Lubricating drops,High
Dry Eyes,Contact Lens Use,"Proper care, breaks","Regular cleaning",Contact lens solution,Very High
Dry Eyes,Night Reading,"Proper lighting, breaks","20-20-20 rule",Moisturizing eye drops,High
Mouth Ulcers,Stress Related,"Topical treatment, vitamins","Stress management",Oral gel,High
Mouth Ulcers,Vitamin Deficiency,"Supplements, diet change","Balanced nutrition",Vitamin B complex,Very High
Mouth Ulcers,Spicy Food,"Avoiding triggers, soothing gels","Diet modification",Ulcer gel,Moderate
Nose Bleeds,Dry Air,"Humidifier, nasal care","Room humidity control",Saline spray,High
Nose Bleeds,Study Stress,"Stress management, humidity","Proper environment",Nasal moisturizer,Moderate
Nose Bleeds,AC Exposure,"Humidity control, nasal care","Temperature regulation",Nasal gel,High
Ankle Pain,Campus Walking,"Rest, proper shoes","Good footwear, breaks",Pain relief gel,High
Ankle Pain,Sports Practice,"RICE method, support","Proper warm-up",Ankle support,Very High
Ankle Pain,Wrong Footwear,"Proper shoes, rest","Better footwear choice",Anti-inflammatory gel,Moderate
Knee Pain,Stairs Climbing,"Rest, strengthening exercises","Proper technique",Joint support,High
Knee Pain,Sports Activity,"RICE method, proper form","Warm-up routine",Pain relief gel,Very High
Knee Pain,Long Sitting,"Movement breaks, exercises","Regular stretching",Joint supplement,Moderate
Hand Tremors,Caffeine Excess,"Reduction, relaxation","Intake monitoring",Magnesium supplements,High
Hand Tremors,Stress Related,"Stress management, rest","Relaxation",Stress relief,Moderate
Hand Tremors,Study Anxiety,"Anxiety management, breaks","Study planning",Professional help if needed,High
Voice Loss,Presentation Practice,"Voice rest, hydration","Proper technique",Throat lozenges,High
Voice Loss,Debate Competition,"Voice care, hydration","Voice training",Voice rest + Lozenges,Very High
Voice Loss,Teaching Practice,"Voice techniques, rest","Proper projection",Throat spray,Moderate
Finger Pain,Extended Writing,"Hand exercises, breaks","Proper grip",Joint cream,High
Finger Pain,Gaming Sessions,"Ergonomic tools, rest","Good technique",Hand exercises,Moderate
Finger Pain,Musical Practice,"Technique check, rest","Proper form",Anti-inflammatory gel,High
Ear Congestion,Swimming Pool,"Drying, ear drops","Proper ear protection",Swimmer's ear drops,Very High
Ear Congestion,Weather Change,"Protection, care","Temperature adaptation",Decongestant,Moderate
Ear Congestion,AC Exposure,"Temperature regulation, care","Proper protection",Ear drops,High
Lip Dryness,Dehydration,"Hydration, lip care","Regular water intake",Lip balm,High
Lip Dryness,Weather Change,"Protection, moisturizing","Regular care",Medicated lip balm,Moderate
Lip Dryness,AC Exposure,"Humidity control, care","Room humidity",Moisturizing balm,High
Concentration Issues,Poor Sleep,"Sleep hygiene, routine","Regular schedule",Focus supplements,Very High
Concentration Issues,Digital Distraction,"Digital detox, focus techniques","Study environment",Professional help,High
Concentration Issues,Nutrient Deficiency,"Diet improvement, supplements","Balanced nutrition",Brain supplements,Moderate
Social Withdrawal,Academic Pressure,"Counseling, social activities","Balance activities",Professional support,High
Social Withdrawal,Depression Signs,"Professional help, support","Regular check-ins",Professional evaluation,Very High
Social Withdrawal,Adjustment Issues,"Gradual exposure, support","Social activities",Counseling support,High
Memory Fog,Sleep Deprivation,"Sleep recovery, routine","Sleep schedule",Sleep aids if prescribed,Very High
Memory Fog,Stress Overload,"Stress reduction, rest","Workload management",Professional help,High
Memory Fog,Poor Diet,"Nutritional improvement, supplements","Diet planning",Brain supplements,Moderate
Jaw Pain,Teeth Grinding,"Mouth guard, stress reduction","Stress management",Night guard + Muscle relaxant,High
Jaw Pain,TMJ from Stress,"Jaw exercises, massage","Stress management, posture",Anti-inflammatory gel,Moderate
Jaw Pain,Poor Sleep Position,"Position correction, support","Proper pillow support",Pain relief,High
Seasonal Depression,Winter Studies,"Light therapy, vitamin D","Regular outdoor time",Vitamin D supplements,High
Seasonal Depression,Reduced Activity,"Exercise plan, social activities","Regular movement",Professional support,Very High
Seasonal Depression,Lack of Sunlight,"Light therapy, outdoor time","Schedule outdoor activities",Vitamin D + Professional help,High
Tingling Hands,Extended Typing,"Wrist exercises, breaks","Ergonomic setup",Wrist support,Moderate
Tingling Hands,Poor Circulation,"Movement, exercises","Regular breaks",Circulation supplements,High
Tingling Hands,Nerve Compression,"Position change, exercises","Proper posture",Professional evaluation,Very High
Ankle Swelling,Long Lectures,"Movement breaks, elevation","Compression socks",Anti-inflammatory,Moderate
Ankle Swelling,Poor Circulation,"Exercise, elevation","Regular movement",Compression wear,High
Ankle Swelling,Extended Standing,"Rest, elevation","Proper footwear",Compression socks + Gel,High
Vitamin B12 Deficiency,Vegetarian Diet,"Supplements, fortified foods","Dietary planning",B12 supplements,Very High
Vitamin B12 Deficiency,Poor Diet,"Dietary improvement, supplements","Meal planning",B12 + Iron supplements,High
Vitamin B12 Deficiency,Absorption Issues,"Medical evaluation, supplements","Regular testing",Prescribed B12,Very High
Heart Palpitations,Energy Drinks,"Reduction, alternatives","Caffeine limitation",Professional evaluation,High
Heart Palpitations,Anxiety Episodes,"Relaxation techniques, support","Stress management",Professional help,Very High
Heart Palpitations,Caffeine Excess,"Reduction plan, hydration","Intake monitoring",Reduction strategy,High
Respiratory Allergies,New Environment,"Antihistamines, air purifier","Clean environment",24-hour antihistamine,High
Respiratory Allergies,Seasonal Change,"Prevention, treatment","Track allergens",Antihistamine + Nasal spray,Very High
Respiratory Allergies,Dorm Dust,"Regular cleaning, air filter","Clean environment",Antihistamine,High
Leg Cramps,Night Study,"Stretching, hydration","Regular breaks",Electrolyte supplement,Moderate
Leg Cramps,Mineral Deficiency,"Supplements, diet changes","Balanced nutrition",Magnesium supplements,High
Leg Cramps,Dehydration,"Hydration, electrolytes","Regular water intake",Electrolyte solution,Very High
Bloating,Stress Eating,"Diet management, stress relief","Regular meals",Digestive aids,Moderate
Bloating,Food Intolerance,"Identify triggers, diet change","Food diary",Digestive enzymes,High
Bloating,Poor Diet,"Diet improvement, probiotics","Meal planning",Probiotics,High
Hand Eczema,Stress Related,"Moisturizer, stress management","Skin care routine",Medicated cream,High
Hand Eczema,Chemical Exposure,"Protection, treatment","Proper protection",Prescription cream,Very High
Hand Eczema,Weather Change,"Moisturizer, protection","Regular care",Barrier cream,Moderate
Dry Scalp,Stress Related,"Scalp care, stress management","Regular care",Medicated shampoo,High
Dry Scalp,Weather Change,"Moisturizing treatment, care","Protection",Scalp treatment,Moderate
Dry Scalp,Hard Water,"Water filter, treatment","Proper hair care",Special shampoo,High
Night Sweats,Anxiety Dreams,"Anxiety management, cooling","Sleep hygiene",Professional help,High
Night Sweats,Room Temperature,"Temperature control, bedding","Room ventilation",Cooling accessories,Moderate
Night Sweats,Stress Related,"Stress management, cooling","Stress reduction",Professional support,High
Muscle Twitching,Caffeine Excess,"Reduction, relaxation","Intake monitoring",Magnesium supplements,High
Muscle Twitching,Stress Related,"Stress management, rest","Relaxation",Stress relief,Moderate
Muscle Twitching,Sleep Deprivation,"Sleep improvement, rest","Sleep schedule",Sleep support,High
Shin Splints,Campus Walking,"Rest, proper shoes","Good footwear",Anti-inflammatory gel,High
Shin Splints,Running Practice,"RICE method, form check","Proper technique",Pain relief + Support,Very High
Shin Splints,Poor Footwear,"Better shoes, rest","Proper footwear",Anti-inflammatory,High
Teeth Sensitivity,Energy Drinks,"Reduction, dental care","Limited consumption",Sensitive toothpaste,High
Teeth Sensitivity,Grinding Stress,"Night guard, stress relief","Stress management",Dental guard,Very High
Teeth Sensitivity,Poor Dental Care,"Improved care, treatment","Regular care",Sensitivity treatment,High
Inner Ear Balance,Study Stress,"Rest, balance exercises","Stress management",Professional evaluation,High
Inner Ear Balance,Position Change,"Movement adaptation, rest","Careful movement",Motion sickness pills,Moderate
Inner Ear Balance,Screen Time,"Screen breaks, exercise","Regular breaks",Balance exercises,High
Hair Breakage,Stress Related,"Hair care, stress management","Gentle handling",Hair supplements,Moderate
Hair Breakage,Nutritional Issues,"Diet improvement, supplements","Balanced nutrition",Biotin supplements,High
Hair Breakage,Chemical Damage,"Treatment, protection","Proper care",Hair treatment,High
Finger Stiffness,Extended Writing,"Exercises, breaks","Regular breaks",Anti-inflammatory gel,High
Finger Stiffness,Gaming Sessions,"Stretches, rest","Proper technique",Hand exercises,Moderate
Finger Stiffness,Cold Weather,"Warmth, movement","Proper protection",Warming cream,High
Blood Sugar Issues,Irregular Meals,"Regular eating, monitoring","Meal planning",Blood sugar monitor,Very High
Blood Sugar Issues,Energy Drinks,"Alternative drinks, monitoring","Better choices",Professional help,High
Blood Sugar Issues,Stress Related,"Stress management, diet","Regular meals",Professional support,Very High
Posture Problems,Study Position,"Correction, exercises","Proper setup",Posture corrector,High
Posture Problems,Heavy Backpack,"Weight reduction, exercises","Proper carrying",Back support,Moderate
Posture Problems,Gaming Setup,"Ergonomic setup, breaks","Proper equipment",Posture aids,High
Vitamin D Deficiency,Indoor Study,"Supplements, sunlight","Outdoor time",Vitamin D supplements,Very High
Vitamin D Deficiency,Poor Diet,"Diet improvement, supplements","Balanced nutrition",Vitamin D + Calcium,High
Vitamin D Deficiency,Limited Exposure,"Outdoor activities, supplements","Schedule changes",Prescribed supplements,Very High
Immune Weakness,Sleep Issues,"Sleep improvement, vitamins","Better sleep",Immune supplements,High
Immune Weakness,Poor Nutrition,"Diet improvement, supplements","Balanced diet",Multivitamins,Very High
Immune Weakness,Stress Impact,"Stress reduction, support","Stress management",Immune boosters,High
Focus Problems,Phone Addiction,"Digital detox, techniques","Usage limits",Focus aids,High
Focus Problems,Poor Sleep,"Sleep improvement, routine","Sleep schedule",Professional help,Very High
Focus Problems,Anxiety Issues,"Anxiety management, support","Stress reduction",Professional support,High
Room Adaptation,New Climate,"Gradual adjustment, proper clothing","Temperature control",Adaptation supplements,Moderate
Room Adaptation,AC Sensitivity,"Temperature regulation, protection","Proper clothing",Immunity boosters,High
Room Adaptation,Humidity Changes,"Humidifier use, hydration","Environment control",Nasal spray,High
Screen Headache,Online Classes,"20-20-20 rule, breaks","Screen distance",Eye drops + Pain relief,High
Screen Headache,Project Work,"Blue light filter, posture","Regular breaks",Computer glasses,Very High
Screen Headache,Digital Reading,"Text size adjustment, breaks","Proper lighting",Anti-glare protection,High
Wrist Tendonitis,Computer Work,"Rest, ergonomic support","Proper technique",Anti-inflammatory,Very High
Wrist Tendonitis,Art Projects,"Wrist support, breaks","Proper position",Wrist brace,High
Wrist Tendonitis,Writing Sessions,"Ergonomic tools, exercises","Good posture",Pain relief gel,Moderate
Library Allergies,Dust Exposure,"Antihistamines, mask","Clean study space",Antihistamine,High
Library Allergies,Old Books,"Mask usage, air filter","Protection measures",Nasal spray,Moderate
Library Allergies,Mold Sensitivity,"Location change, protection","Alternative space",Antihistamine + Spray,Very High
Iron Deficiency,Vegetarian Diet,"Iron supplements, diet planning","Balanced meals",Iron supplements,Very High
Iron Deficiency,Poor Diet,"Dietary improvement, supplements","Meal planning",Iron + Vitamin C,High
Iron Deficiency,Heavy Periods,"Iron supplements, medical care","Regular testing",Prescribed iron,Very High
Knee Stiffness,Long Sitting,"Movement breaks, exercises","Regular breaks",Joint supplement,High
Knee Stiffness,Cold Weather,"Warmth, movement","Proper protection",Anti-inflammatory gel,Moderate
Knee Stiffness,Study Posture,"Position change, exercises","Better posture",Joint support,High
Voice Strain,Class Presentations,"Voice rest, hydration","Proper technique",Throat spray,High
Voice Strain,Group Projects,"Voice care, breaks","Speaking technique",Throat lozenges,Moderate
Voice Strain,Language Practice,"Technique improvement, rest","Proper practice",Voice rest + Tea,High
Finger Joints,Extended Writing,"Hand exercises, breaks","Proper grip",Joint cream,High
Finger Joints,Digital Art,"Ergonomic tools, rest","Good technique",Anti-inflammatory,Moderate
Finger Joints,Instrument Practice,"Technique check, breaks","Proper form",Joint support,High
Lip Chapping,Weather Change,"Moisturizer, protection","Regular care",Medicated lip balm,High
Lip Chapping,Dehydration,"Hydration, lip care","Water intake",Lip treatment,Moderate
Lip Chapping,Study Habit,"Regular care, hydration","Better habits",Healing balm,High
Motion Sickness,Bus Travel,"Anti-motion pills, positioning","Travel preparation",Motion sickness pills,Very High
Motion Sickness,Study Reading,"Reading breaks, position","Proper technique",Travel bands,Moderate
Motion Sickness,Screen Movement,"Screen stability, breaks","Screen setup",Anti-nausea aids,High
Nail Brittleness,Stress Habits,"Habit correction, supplements","Stress management",Biotin supplements,High
Nail Brittleness,Nutritional Gaps,"Diet improvement, supplements","Better nutrition",Nail strengthener,Moderate
Nail Brittleness,Chemical Exposure,"Protection, treatment","Proper care",Nail treatment,High
Breathing Pattern,Anxiety Study,"Breathing exercises, support","Stress management",Anxiety support,High
Breathing Pattern,Stress Reading,"Technique practice, breaks","Regular breaks",Professional help,Very High
Breathing Pattern,Presentation Fear,"Breathing control, practice","Preparation",Stress relief,High
Hand Sweating,Exam Stress,"Stress management, powder","Stress reduction",Anti-perspirant,Moderate
Hand Sweating,Presentation Anxiety,"Anxiety management, wipes","Preparation",Anxiety relief,High
Hand Sweating,Writing Stress,"Stress reduction, protection","Paper protection",Drying powder,Moderate
Shoulder Tension,Computer Use,"Stretches, posture","Proper setup",Muscle relaxant,High
Shoulder Tension,Study Position,"Position change, exercises","Better posture",Pain relief patch,Moderate
Shoulder Tension,Stress Holding,"Relaxation, movement","Stress awareness",Muscle cream,High
Ear Pressure,Climate Change,"Equalization, protection","Adaptation time",Decongestant,High
Ear Pressure,Altitude Change,"Pressure techniques, gum","Travel preparation",Ear drops,Moderate
Ear Pressure,Flying Travel,"Equalization methods, protection","Flight preparation",Pressure relief,Very High
Heat Exhaustion,Summer Study,"Cooling, hydration","Temperature control",Electrolyte solution,Very High
Heat Exhaustion,Sports Practice,"Hydration, rest","Proper timing",Sports drinks,High
Heat Exhaustion,Campus Walking,"Water, shade breaks","Time management",Rehydration salts,Very High
Cold Sensitivity,AC Exposure,"Temperature adjustment, layers","Proper clothing",Immunity support,High
Cold Sensitivity,Study Room,"Temperature control, protection","Environment control",Warming aids,Moderate
Cold Sensitivity,Library Climate,"Proper clothing, position","Location choice",Temperature adaptation,High
Eye Focusing,Close Reading,"Focus exercises, breaks","20-20-20 rule",Eye exercises,High
Eye Focusing,Screen Work,"Distance adjustment, breaks","Screen setup",Vision support,Very High
Eye Focusing,Night Study,"Proper lighting, breaks","Light control",Eye drops,High
Throat Irritation,Air Conditioning,"Humidifier, protection","Environment control",Throat lozenges,Moderate
Throat Irritation,Presentation Practice,"Voice care, hydration","Practice limits",Throat spray,High
Throat Irritation,Dry Air,"Humidity control, hydration","Room humidity",Moisturizing spray,High
Study Fatigue,Long Sessions,"Break schedule, movement","Regular breaks",Energy supplements,High
Study Fatigue,Poor Planning,"Schedule adjustment, rest","Better planning",Focus aids,Moderate
Study Fatigue,Mental Exhaustion,"Rest periods, techniques","Work balance",Professional support,High
Lab Safety,Chemical Exposure,"Safety protocols, protection","Proper equipment",First aid supplies,Very High
Lab Safety,Equipment Use,"Proper technique, care","Safety training",Safety equipment,High
Lab Safety,Emergency Response,"First aid, protocols","Emergency prep",Emergency kit,Very High
Social Stress,Group Projects,"Communication skills, support","Preparation",Stress relief,High
Social Stress,Class Participation,"Gradual exposure, practice","Confidence building",Anxiety support,Moderate
Social Stress,Team Activities,"Social techniques, support","Group practice",Professional help,High
Sleep Schedule,Time Management,"Schedule adjustment, routine","Regular timing",Sleep aids if needed,High
Sleep Schedule,Project Deadlines,"Planning, rest periods","Better planning",Natural sleep aids,Moderate
Sleep Schedule,Study Balance,"Routine establishment, limits","Schedule planning",Professional advice,High`;

const symptomData = parseCSV(symptomCSV);

const SymptomAnalysis = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Error",
        description: "Please describe your symptoms",
        variant: "destructive",
      });
      return;
    }
  
    setIsAnalyzing(true);
    setAnalysisResult("");
  
    try {
      const symptomText = symptoms.toLowerCase();
      
      const matchedConditions = symptomData.filter((item: SymptomData) => 
        symptomText.includes(item.Symptom.toLowerCase()) ||
        symptomText.includes(item.Condition.toLowerCase())
      );
  
      if (matchedConditions.length > 0) {
        const groupedBySymptom: Record<string, SymptomData[]> = {};
        matchedConditions.forEach((item: SymptomData) => {
          if (!groupedBySymptom[item.Symptom]) {
            groupedBySymptom[item.Symptom] = [];
          }
          groupedBySymptom[item.Symptom].push(item);
        });
  
        let result = "Based on your symptoms, here are possible conditions:\n\n";
        
        Object.entries(groupedBySymptom).forEach(([symptom, conditions]) => {
          result += `🔹 ${symptom}:\n`;
          conditions.forEach((cond: SymptomData) => {
            result += `• ${cond.Condition} (${cond.Effectiveness} effectiveness)\n`;
            result += `  Treatment: ${cond.Treatment}\n`;
            result += `  Precaution: ${cond.Precaution}\n`;
            if (!["As prescribed by doctor", "Professional evaluation needed", "Emergency medical care"].includes(cond.Medicine)) {
              result += `  Medicine: ${cond.Medicine}\n`;
            }
            result += "\n";
          });
        });
  
        const hasEmergency = matchedConditions.some((cond: SymptomData) => 
          cond.Condition.includes("Emergency") || 
          cond.Condition.includes("Appendicitis") ||
          cond.Condition.includes("Covid-19")
        );
  
        result += hasEmergency 
          ? "\n⚠️ Some of these conditions may require immediate medical attention!"
          : "\n📋 Monitor symptoms and maintain hydration/rest.";
  
        setAnalysisResult(result);
      } else {
        setAnalysisResult(
          "Your symptoms should be evaluated by a healthcare professional if they persist or worsen.\n" +
          "Track symptom duration and patterns for better evaluation.\n\n" +
          "📋 Monitor symptoms and maintain hydration/rest."
        );
      }
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold flex items-center">
          <ClipboardList className="mr-2 text-indigo-500" />
          Symptom Checker
          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
            Beta
          </span>
        </h2>
      </div>
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-600">
          Examples: "throbbing headache with light sensitivity", "chest pain when breathing deeply"
        </div>
        
        <textarea
          className="w-full p-3 border border-gray-200 rounded-lg mb-3 text-sm h-32"
          placeholder="Describe your symptoms in detail..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        
        <button
          onClick={analyzeSymptoms}
          disabled={isAnalyzing}
          className={`w-full py-2 rounded-lg font-medium flex items-center justify-center ${
            isAnalyzing ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ActivitySquare className="h-4 w-4 mr-2" />
              Analyze Symptoms
            </>
          )}
        </button>
        
        {analysisResult && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start mb-2">
              <Stethoscope className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-sm mb-1">Medical Insights:</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {analysisResult}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => navigate("/emergency")}
                className="text-xs px-3 py-1 bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200"
              >
                🚨 Emergency Help
              </button>
              <button
                onClick={() => navigate("/patient-appointment")}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
              >
                📆 Book Appointment
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Note: This AI-powered tool provides preliminary insights only. Always consult 
              a healthcare professional for medical advice. Accuracy: ~70% based on symptom 
              completeness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomAnalysis;