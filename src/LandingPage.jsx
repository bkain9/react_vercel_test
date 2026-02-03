import React from 'react';

function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-cyan-500 selection:text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                NovaCorp
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <a href="#home" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</a>
                                <a href="#about" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">About</a>
                                <a href="#services" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Services</a>
                                <a href="#contact" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105">
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                        Innovating the <br />
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Future of Tech
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 mb-10">
                        We build digital experiences that transform businesses. Cutting-edge solutions for the modern world.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="#contact" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1">
                            Get Started
                        </a>
                        <a href="#services" className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-full font-bold text-lg hover:bg-slate-700 transition-all">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 bg-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Comprehensive solutions tailored to your business needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Web Development', desc: 'High-performance websites built with modern technologies.', icon: '💻' },
                            { title: 'Mobile Apps', desc: 'Native and cross-platform mobile applications.', icon: '📱' },
                            { title: 'Cloud Solutions', desc: 'Scalable cloud infrastructure and deployment.', icon: '☁️' },
                        ].map((service, index) => (
                            <div key={index} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 group">
                                <div className="text-4xl mb-6">{service.icon}</div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                                <p className="text-slate-400">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">About NovaCorp</h2>
                            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                Founded in 2024, NovaCorp has been at the forefront of digital innovation. We believe in the power of technology to solve complex problems and create meaningful impact.
                            </p>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                Our team of experts is dedicated to delivering excellence in every project we undertake, ensuring that our clients stay ahead in a rapidly evolving digital landscape.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-3xl font-bold text-cyan-400 mb-1">50+</div>
                                    <div className="text-sm text-slate-500">Projects Completed</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-500 mb-1">98%</div>
                                    <div className="text-sm text-slate-500">Client Satisfaction</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl transform rotate-3 opacity-20 blur-lg"></div>
                            <div className="relative bg-slate-800 p-8 rounded-2xl border border-slate-700">
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-slate-700 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                                    <div>
                                        <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
                                        <div className="h-3 bg-slate-700 rounded w-16"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-slate-800/50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to start your project?</h2>
                    <p className="text-slate-400 mb-10 text-lg">
                        Get in touch with us today and let's build something amazing together.
                    </p>
                    <a href="mailto:contact@novacorp.com" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-1">
                        Contact Us Now
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} NovaCorp. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default LandingPage;
