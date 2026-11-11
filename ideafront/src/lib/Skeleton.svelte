<script>
  export let className = '';
  export let label = 'Cargando contenido';
</script>

<div class={`skeleton ${className}`} role="status" aria-label={label} aria-live="polite"></div>
