
(() => {
	const carousel = document.querySelector(
		"[data-print-carousel]"
	);

	if (!carousel) return;

	const track = carousel.querySelector(
		"[data-print-track]"
	);

	const slides = [
		...track.querySelectorAll(".print-slide"),
	];

	const dots = [
		...carousel.querySelectorAll("[data-print-dot]"),
	];

	const prev = carousel.querySelector(
		"[data-print-prev]"
	);

	const next = carousel.querySelector(
		"[data-print-next]"
	);

	const status = carousel.querySelector(
		"[data-print-status]"
	);

	if (!slides.length) return;
 const german = document.documentElement.lang.startsWith("de");

	let activeIndex = 0;
	let scrollFrame = null;

	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	);

	function update(index) {
		activeIndex = Math.max(
			0,
			Math.min(index, slides.length - 1)
		);

		dots.forEach((dot, i) => {
			dot.setAttribute(
				"aria-current",
				String(i === activeIndex)
			);
		});

		if (prev) {
			prev.disabled = activeIndex === 0;
		}

		if (next) {
			next.disabled =
				activeIndex === slides.length - 1;
		}

		if (status) {
			status.textContent =
				german ? `Bild ${activeIndex + 1} von ${slides.length}` : `Slide ${activeIndex + 1} of ${slides.length}`;
		}
	}

	function goTo(index) {
		const targetIndex = Math.max(
			0,
			Math.min(index, slides.length - 1)
		);

		const left =
			slides[targetIndex].offsetLeft -
			slides[0].offsetLeft;

		track.scrollTo({
			left,
			behavior: reducedMotion.matches
				? "auto"
				: "smooth",
		});

		update(targetIndex);
	}

	prev?.addEventListener("click", () => {
		goTo(activeIndex - 1);
	});

	next?.addEventListener("click", () => {
		goTo(activeIndex + 1);
	});

	dots.forEach((dot, index) => {
		dot.addEventListener("click", () => {
			goTo(index);
		});
	});

	track.addEventListener("keydown", (event) => {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			goTo(activeIndex + 1);
		}

		if (event.key === "ArrowLeft") {
			event.preventDefault();
			goTo(activeIndex - 1);
		}
	});

	track.addEventListener("scroll", () => {
		if (scrollFrame !== null) {
			cancelAnimationFrame(scrollFrame);
		}

		scrollFrame = requestAnimationFrame(() => {
			const currentLeft = track.scrollLeft;
			const firstLeft = slides[0].offsetLeft;

			let closestIndex = 0;
			let closestDistance = Infinity;

			slides.forEach((slide, index) => {
				const distance = Math.abs(
					(slide.offsetLeft - firstLeft) -
					currentLeft
				);

				if (distance < closestDistance) {
					closestDistance = distance;
					closestIndex = index;
				}
			});

			update(closestIndex);
			scrollFrame = null;
		});
	}, { passive: true });

	update(0);
})();
