import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private animationFrameId?: number;
  
  ngAfterViewInit(): void {
    this.initScrollAnimations();
    this.initStatsAnimation();
    this.initSmoothScrolling();
    this.initDemoControls();
    this.initNavHighlighting();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initScrollAnimations(): void {
    const sections = document.querySelectorAll('.fade-section');

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '50px 0px -50px 0px'
    });

    sections.forEach(section => this.observer!.observe(section));
  }

  private initStatsAnimation(): void {
    const statsElements = document.querySelectorAll('.stat-number');
    
    const animateStats = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const target = parseFloat(element.dataset['target'] || '0');
          this.animateNumber(element, target);
        }
      });
    };

    const statsObserver = new IntersectionObserver(animateStats, { threshold: 0.5 });
    statsElements.forEach(stat => statsObserver.observe(stat));
  }

  private animateNumber(element: HTMLElement, target: number): void {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;

    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (target - startValue) * easedProgress;
      
      if (target < 1) {
        element.textContent = currentValue.toFixed(1);
      } else {
        element.textContent = Math.floor(currentValue).toString();
      }
      
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }

  private initSmoothScrolling(): void {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href.substring(1);
          const targetSection = document.getElementById(targetId);
          
          if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // Scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    scrollIndicator?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private initNavHighlighting(): void {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const highlightNav = () => {
      let current = '';
      const scrollPos = window.pageYOffset + 100;

      sections.forEach(section => {
        const element = section as HTMLElement;
        const sectionTop = element.offsetTop;
        const sectionHeight = element.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          current = section.id;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', highlightNav);
  }

  private initDemoControls(): void {
    const demoButtons = document.querySelectorAll('.demo-btn');
    const cameraFeed = document.querySelector('.camera-feed');
    const faceOutline = document.querySelector('.face-outline');
    const statusIndicator = document.querySelector('.status-indicator');

    demoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        demoButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const demoType = btn.getAttribute('data-demo');
        this.updateDemoState(demoType, cameraFeed, faceOutline, statusIndicator);
      });
    });
  }

  private updateDemoState(
    demoType: string | null, 
    cameraFeed: Element | null,
    faceOutline: Element | null,
    statusIndicator: Element | null
  ): void {
    if (!cameraFeed || !faceOutline || !statusIndicator) return;

    // Reset classes
    faceOutline.className = 'face-outline';
    const statusDot = statusIndicator.querySelector('.status-dot') as HTMLElement;
    const statusText = statusIndicator.querySelector('span') as HTMLElement;

    switch(demoType) {
      case 'scanning':
        if (statusDot) {
          statusDot.style.background = '#10b981'; // success color
        }
        if (statusText) {
          statusText.textContent = 'Reconocimiento Activo';
          statusText.style.color = '#10b981';
        }
        break;

      case 'success':
        faceOutline.classList.add('success');
        if (statusDot) {
          statusDot.style.background = '#06d6a0'; // accent color
        }
        if (statusText) {
          statusText.textContent = 'Acceso Concedido ✓';
          statusText.style.color = '#06d6a0';
        }
        // Add success animation
        this.triggerSuccessAnimation(faceOutline);
        break;

      case 'denied':
        faceOutline.classList.add('denied');
        if (statusDot) {
          statusDot.style.background = '#ef4444'; // danger color
        }
        if (statusText) {
          statusText.textContent = 'Acceso Denegado ✗';
          statusText.style.color = '#ef4444';
        }
        // Add denied animation
        this.triggerDeniedAnimation(faceOutline);
        break;
    }
  }

  private triggerSuccessAnimation(element: Element): void {
    const htmlElement = element as HTMLElement;
    htmlElement.style.borderColor = '#06d6a0';
    htmlElement.style.boxShadow = '0 0 30px rgba(6, 214, 160, 0.5)';
    
    setTimeout(() => {
      htmlElement.style.borderColor = '';
      htmlElement.style.boxShadow = '';
    }, 2000);
  }

  private triggerDeniedAnimation(element: Element): void {
    const htmlElement = element as HTMLElement;
    htmlElement.style.borderColor = '#ef4444';
    htmlElement.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
      htmlElement.style.borderColor = '';
      htmlElement.style.animation = '';
    }, 500);
  }
}