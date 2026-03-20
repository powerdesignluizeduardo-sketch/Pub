import imgBear from "../../assets/bear-english.png";
import imgFibonacci from "../../assets/fibonacci.png";
import imgHumboldt from "../../assets/humboldt.png";
import imgEinstein from "../../assets/einstein.png";

interface SelectTutorScreenProps {
  onSelect: (tutor: string) => void;
}

const tutors = [
  { id: "ingles", name: "Ingles", subtitle: "Maple Bear", image: imgBear },
  { id: "matematica", name: "Matematica", subtitle: "Leonardo Fibonacci", image: imgFibonacci },
  { id: "geografia", name: "Geografia", subtitle: "Alexander von Humboldt", image: imgHumboldt },
  { id: "fisica", name: "Fisica", subtitle: "Einstein", image: imgEinstein },
  { id: "historia", name: "Historia", subtitle: "Em breve", image: imgEinstein, disabled: true },
];

export function SelectTutorScreen({ onSelect }: SelectTutorScreenProps) {
  return (
    <div className="relative w-full h-full bg-[#ab4d4d] flex flex-col overflow-y-auto">
      {/* Title */}
      <div className="flex-shrink-0 px-5 sm:px-8 lg:px-12 pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-5">
        <h1
          className="text-white text-center text-[clamp(22px,5vw,48px)] leading-[1.1]"
          style={{
            fontFamily: "'Luckiest Guy', cursive",
            textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
          }}
        >
          SELECIONE SEU TUTOR
        </h1>
      </div>

      {/* Tutor cards grid */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 max-w-[1400px] mx-auto">
          {tutors.map((tutor) => (
            <button
              key={tutor.id}
              onClick={() => !tutor.disabled && onSelect(tutor.id)}
              className={`relative w-full rounded-[14px] sm:rounded-[18px] lg:rounded-[22px] overflow-hidden group ${
                tutor.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "active:scale-[0.97] hover:scale-[1.02] transition-transform cursor-pointer"
              }`}
              style={{ aspectRatio: "3/4" }}
            >
              {/* Background */}
              <div className={`absolute inset-0 ${tutor.disabled ? "bg-[#ece6f0]" : ""}`}>
                <img
                  alt={tutor.name}
                  className={`absolute inset-0 w-full h-full ${
                    tutor.disabled ? "mix-blend-luminosity object-contain" : "object-cover"
                  } transition-transform duration-500 group-hover:scale-105`}
                  src={tutor.image}
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-left">
                <p
                  className="text-white text-[clamp(16px,3.5vw,32px)] lg:text-[clamp(18px,1.5vw,28px)] leading-[1.1]"
                  style={{ fontFamily: "'Luckiest Guy', cursive" }}
                >
                  {tutor.name}
                </p>
                <p
                  className="text-white/75 text-[clamp(10px,2vw,14px)] lg:text-[clamp(11px,0.9vw,15px)] leading-[1.3] mt-0.5 font-['Inter',sans-serif]"
                >
                  {tutor.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
