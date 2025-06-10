import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
const Footer: React.FC = () => {
  return <footer className="bg-card text-card-foreground mt-8 sm:mt-12 border-t-2 border-dashed border-border pt-6 sm:pt-8 pb-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-[36px] my-0 w-full">
      <div className="w-full max-w-none">
        <div className="flex flex-wrap">
          <div className="w-full md:w-4/12 mb-6 sm:mb-8 md:mb-0">
            <h4 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 gradient-text-animated">
              Smaran.ai
            </h4>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
              AI-powered learning platform for students with comprehensive tools for education and skill development.
            </p>
            <div className="flex space-x-2 justify-center sm:justify-start sm:px-0">
              <a href="#" className="bg-kid-blue hover:bg-blue-600 text-white p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="bg-kid-purple hover:bg-purple-600 text-white p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="bg-kid-red hover:bg-red-600 text-white p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-8/12">
            <div className="flex flex-wrap mb-4 sm:mb-6">
              <div className="w-full sm:w-4/12 mb-4 sm:mb-6 sm:mb-0">
                <h5 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h5>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link to="/" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Home</Link>
                  </li>
                  <li>
                    <Link to="/subjects" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Subjects</Link>
                  </li>
                  <li>
                    <Link to="/flashcards" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Flashcards</Link>
                  </li>
                  <li>
                    <Link to="/study-planner" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Study Planner</Link>
                  </li>
                </ul>
              </div>

              <div className="w-full sm:w-4/12 mb-4 sm:mb-6 sm:mb-0">
                <h5 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">AI Tools</h5>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link to="/socratic-tutor" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Socratic Tutor</Link>
                  </li>
                  <li>
                    <Link to="/voice-bot" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Voice Assistant</Link>
                  </li>
                  <li>
                    <Link to="/grammar" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Grammar Assistant</Link>
                  </li>
                  <li>
                    <Link to="/teacher" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Teacher Tools</Link>
                  </li>
                </ul>
              </div>

              <div className="w-full sm:w-4/12">
                <h5 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Learning Tools</h5>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link to="/pomodoro" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Pomodoro Timer</Link>
                  </li>
                  <li>
                    <Link to="/story-images" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Story Images</Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Profile & Progress</Link>
                  </li>
                  <li>
                    <Link to="/firebase-history" className="text-sm sm:text-base text-muted-foreground hover:text-kid-blue transition-colors">Learning History</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-dashed border-border mt-4 sm:mt-6 pt-4 sm:pt-6 flex flex-col items-center text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 flex items-center justify-center">
            Made with <Heart className="text-kid-red mx-1 h-3 w-3 sm:h-4 sm:w-4" /> for learners everywhere
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Smaran.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;